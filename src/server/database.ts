import Database from "better-sqlite3";
import { mkdirSync, chmodSync } from "node:fs";
import { resolve, join } from "node:path";
import { randomUUID } from "node:crypto";
import type { Note, Progress, User } from "@/lib/types";
import type { PracticeCourse, PracticeEntry, PracticeSummary } from "@/lib/practice-types";
import { practiceLimits } from "@/lib/practice-types";
import { createPracticeLessons } from "@/lib/practice-generator";

export interface AccountRecord {
  id: string;
  name: string;
  is_guest: number;
  password_salt: string | null;
  password_hash: string | null;
}

export interface SessionRecord {
  user: User;
  isGuest: boolean;
  expiresAt: number;
}

const shared = globalThis as typeof globalThis & { codestepsDatabase?: Database.Database };

function openDatabase() {
  const directory = resolve(/* turbopackIgnore: true */ process.env.CODESTEPS_DATA_DIR || ".data");
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  const filename = join(directory, "codesteps.db");
  const db = new Database(filename);
  chmodSync(filename, 0o600);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.pragma("busy_timeout = 5000");
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      username TEXT UNIQUE,
      is_guest INTEGER NOT NULL CHECK (is_guest IN (0, 1)),
      password_salt TEXT,
      password_hash TEXT,
      CHECK ((is_guest = 1 AND username IS NULL AND password_hash IS NULL AND password_salt IS NULL)
        OR (is_guest = 0 AND username IS NOT NULL AND password_hash IS NOT NULL AND password_salt IS NOT NULL))
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires_at);
    CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id);
    CREATE TABLE IF NOT EXISTS completions (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      kind TEXT NOT NULL CHECK (kind IN ('lesson', 'challenge')),
      item_id TEXT NOT NULL,
      PRIMARY KEY (user_id, kind, item_id)
    );
    CREATE TABLE IF NOT EXISTS notes (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      lesson_id TEXT NOT NULL,
      content TEXT NOT NULL CHECK (length(content) <= 5000),
      updated_at TEXT NOT NULL,
      PRIMARY KEY (user_id, lesson_id)
    );
    CREATE TABLE IF NOT EXISTS rate_limits (
      key TEXT PRIMARY KEY,
      count INTEGER NOT NULL,
      expires_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS rate_limits_expiry ON rate_limits(expires_at);
    CREATE TABLE IF NOT EXISTS practice_courses (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      document TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS practice_courses_user ON practice_courses(user_id);
  `);
  return db;
}

function database() {
  return shared.codestepsDatabase ??= openDatabase();
}

/** Fixed-window counters survive restarts; expired keys are removed on every use. */
export function consumeLimit(key: string, max: number, windowSeconds: number): boolean {
  if (!key || key.length > 256 || !Number.isSafeInteger(max) || max < 1 ||
    !Number.isSafeInteger(windowSeconds) || windowSeconds < 1 || windowSeconds > 86400) {
    throw new Error("Invalid rate limit.");
  }
  const db = database();
  return db.transaction(() => {
    const now = Date.now();
    db.prepare("DELETE FROM rate_limits WHERE expires_at <= ?").run(now);
    const current = db.prepare("SELECT count FROM rate_limits WHERE key = ?").get(key) as { count: number } | undefined;
    if (current) {
      if (current.count >= max) return false;
      db.prepare("UPDATE rate_limits SET count = count + 1 WHERE key = ?").run(key);
      return true;
    }
    // Fail closed rather than evicting active limits when the key budget is exhausted.
    if ((db.prepare("SELECT count(*) AS total FROM rate_limits").get() as { total: number }).total >= 10000) return false;
    db.prepare("INSERT INTO rate_limits (key, count, expires_at) VALUES (?, 1, ?)").run(key, now + windowSeconds * 1000);
    return true;
  }).immediate();
}

export function findAccount(username: string): AccountRecord | undefined {
  return database().prepare("SELECT id, name, is_guest, password_salt, password_hash FROM users WHERE username = ? AND is_guest = 0").get(username) as AccountRecord | undefined;
}

export function findSession(tokenHash: string): SessionRecord | undefined {
  const row = database().prepare(`
    SELECT u.id, u.name, u.is_guest, s.expires_at FROM sessions s
    JOIN users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > ?
  `).get(tokenHash, Date.now()) as { id: string; name: string; is_guest: number; expires_at: number } | undefined;
  return row ? { user: { id: row.id, name: row.name }, isGuest: Boolean(row.is_guest), expiresAt: row.expires_at } : undefined;
}

export function createGuest(tokenHash: string, expiresAt: number): SessionRecord {
  const db = database();
  return db.transaction(() => {
    db.prepare("DELETE FROM sessions WHERE expires_at <= ?").run(Date.now());
    db.prepare("DELETE FROM users WHERE is_guest = 1 AND NOT EXISTS (SELECT 1 FROM sessions WHERE user_id = users.id)").run();
    const user: User = { id: randomUUID(), name: "Learner" };
    db.prepare("INSERT INTO users (id, name, is_guest) VALUES (?, ?, 1)").run(user.id, user.name);
    db.prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)").run(tokenHash, user.id, expiresAt);
    return { user, isGuest: true, expiresAt };
  }).immediate();
}

export interface AccountSessionInput {
  account: { id: string; username: string; salt: string; passwordHash: string } | { id: string };
  oldTokenHash?: string;
  tokenHash: string;
  expiresAt: number;
}

/** Account creation, guest migration, and session rotation are one transaction. */
export function createAccountSession(input: AccountSessionInput): SessionRecord {
  const db = database();
  return db.transaction(() => {
    const { account } = input;
    if ("username" in account) {
      db.prepare("INSERT INTO users (id, name, username, is_guest, password_salt, password_hash) VALUES (?, ?, ?, 0, ?, ?)")
        .run(account.id, account.username, account.username, account.salt, account.passwordHash);
    }
    const target = db.prepare("SELECT id, name FROM users WHERE id = ? AND is_guest = 0").get(account.id) as User | undefined;
    if (!target) throw new Error("Account not found.");
    const previous = input.oldTokenHash ? findSession(input.oldTokenHash) : undefined;
    if (previous?.isGuest) {
      db.prepare("INSERT OR IGNORE INTO completions (user_id, kind, item_id) SELECT ?, kind, item_id FROM completions WHERE user_id = ?")
        .run(target.id, previous.user.id);
      db.prepare("INSERT OR IGNORE INTO notes (user_id, lesson_id, content, updated_at) SELECT ?, lesson_id, content, updated_at FROM notes WHERE user_id = ?")
        .run(target.id, previous.user.id);
      db.prepare("UPDATE practice_courses SET user_id = ? WHERE user_id = ?").run(target.id, previous.user.id);
      db.prepare("DELETE FROM users WHERE id = ? AND is_guest = 1").run(previous.user.id);
    }
    if (input.oldTokenHash) db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(input.oldTokenHash);
    db.prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)").run(input.tokenHash, target.id, input.expiresAt);
    return { user: target, isGuest: false, expiresAt: input.expiresAt };
  }).immediate();
}

export function deleteSession(tokenHash: string): void {
  const db = database();
  db.transaction(() => {
    const session = findSession(tokenHash);
    db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(tokenHash);
    if (session?.isGuest) db.prepare("DELETE FROM users WHERE id = ? AND is_guest = 1").run(session.user.id);
  }).immediate();
}

export function readProgress(userId: string): Progress {
  const rows = database().prepare("SELECT kind, item_id FROM completions WHERE user_id = ? ORDER BY item_id").all(userId) as { kind: string; item_id: string }[];
  return {
    userId,
    completedLessonIds: rows.filter((row) => row.kind === "lesson").map((row) => row.item_id),
    completedChallengeIds: rows.filter((row) => row.kind === "challenge").map((row) => row.item_id),
  };
}

export function persistProgress(userId: string, kind: "lesson" | "challenge", id: string, complete: boolean): Progress {
  const db = database();
  return db.transaction(() => {
    if (complete) db.prepare("INSERT OR IGNORE INTO completions (user_id, kind, item_id) VALUES (?, ?, ?)").run(userId, kind, id);
    else db.prepare("DELETE FROM completions WHERE user_id = ? AND kind = ? AND item_id = ?").run(userId, kind, id);
    return readProgress(userId);
  }).immediate();
}

export function readNotes(userId: string): Map<string, Note> {
  const rows = database().prepare("SELECT lesson_id AS lessonId, user_id AS userId, content, updated_at AS updatedAt FROM notes WHERE user_id = ?").all(userId) as Note[];
  return new Map(rows.map((note) => [note.lessonId, note]));
}

export function saveNote(userId: string, lessonId: string, content: string): Note {
  const note: Note = { userId, lessonId, content, updatedAt: new Date().toISOString() };
  database().prepare(`INSERT INTO notes (user_id, lesson_id, content, updated_at) VALUES (?, ?, ?, ?)
    ON CONFLICT(user_id, lesson_id) DO UPDATE SET content = excluded.content, updated_at = excluded.updated_at`)
    .run(userId, lessonId, content, note.updatedAt);
  return note;
}

export class PracticeError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

export function readPracticeCourse(userId: string, id: string): PracticeCourse | undefined {
  const row = database().prepare("SELECT document FROM practice_courses WHERE user_id = ? AND id = ?").get(userId, id) as { document: string } | undefined;
  return row ? JSON.parse(row.document) as PracticeCourse : undefined;
}

export function listPracticeCourses(userId: string): PracticeSummary[] {
  const rows = database().prepare("SELECT document FROM practice_courses WHERE user_id = ? ORDER BY rowid DESC").all(userId) as { document: string }[];
  return rows.map(({ document }) => {
    const course = JSON.parse(document) as PracticeCourse;
    return {
      id: course.id, title: course.title, topic: course.topic, createdAt: course.createdAt,
      lessonCount: course.lessons.length,
      completedCount: Object.values(course.entries).filter((entry) => entry.complete).length,
    };
  });
}

export function insertPracticeCourse(userId: string, course: PracticeCourse): void {
  const db = database();
  db.transaction(() => {
    const { total } = db.prepare("SELECT count(*) AS total FROM practice_courses WHERE user_id = ?").get(userId) as { total: number };
    if (total >= 12) throw new PracticeError("You can save 12 courses. Delete an older course before creating another.", 409);
    db.prepare("INSERT INTO practice_courses (id, user_id, document) VALUES (?, ?, ?)").run(course.id, userId, JSON.stringify(course));
  }).immediate();
}

export function updatePracticeCourse(userId: string, id: string, update: { additionalNotes: string } | { improvedNotes: string } | { lessonId: string; entry: PracticeEntry }): PracticeCourse {
  const db = database();
  return db.transaction(() => {
    const course = readPracticeCourse(userId, id);
    if (!course) throw new PracticeError("Course not found.", 404);
    if ("additionalNotes" in update) {
      const combined = `${course.sourceNotes}\n\n${update.additionalNotes}`;
      if (combined.length > practiceLimits.totalCharacters || Buffer.byteLength(combined, "utf8") > practiceLimits.totalBytes) {
        throw new PracticeError("Combined notes must fit within 100,000 characters and 200 KB. Start another course for more notes.");
      }
      const additions = createPracticeLessons(course.topic, update.additionalNotes)
        .filter((lesson) => !course.lessons.some((existing) => existing.id === lesson.id));
      course.sourceNotes = combined;
      course.lessons.push(...additions);
    } else if ("improvedNotes" in update) {
      course.improvedNotes = update.improvedNotes;
    } else {
      const lesson = course.lessons.find((item) => item.id === update.lessonId);
      if (!lesson) throw new PracticeError("Lesson not found in this course.", 404);
      if (update.entry.quizChoice !== null && update.entry.quizChoice >= lesson.quiz.choices.length) {
        throw new PracticeError("Choose one of this lesson's quiz options.");
      }
      if (update.entry.complete && (!update.entry.answer.trim() || !update.entry.reflection.trim() ||
        update.entry.quizChoice !== lesson.quiz.answerIndex)) {
        throw new PracticeError("Attempt the exercise, answer the quiz correctly, and write a reflection before completing the lesson.");
      }
      course.entries[update.lessonId] = update.entry;
    }
    db.prepare("UPDATE practice_courses SET document = ? WHERE user_id = ? AND id = ?").run(JSON.stringify(course), userId, id);
    return course;
  }).immediate();
}

export function deletePracticeCourse(userId: string, id: string): boolean {
  return database().prepare("DELETE FROM practice_courses WHERE user_id = ? AND id = ?").run(userId, id).changes > 0;
}
