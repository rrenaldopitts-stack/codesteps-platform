import { databaseDriver, type Queryable } from "./database-driver";
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

const schema = `
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
    expires_at BIGINT NOT NULL
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
    expires_at BIGINT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS rate_limits_expiry ON rate_limits(expires_at);
  CREATE TABLE IF NOT EXISTS practice_courses (
    seq BIGSERIAL,
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS practice_courses_user ON practice_courses(user_id);
`;

function ready() {
  return databaseDriver(schema);
}

function transaction<T>(work: (client: Queryable) => Promise<T>): Promise<T> {
  return ready().transaction(work);
}

/** Fixed-window counters survive restarts; expired keys are removed on every use. */
export async function consumeLimit(key: string, max: number, windowSeconds: number): Promise<boolean> {
  if (!key || key.length > 256 || !Number.isSafeInteger(max) || max < 1 ||
    !Number.isSafeInteger(windowSeconds) || windowSeconds < 1 || windowSeconds > 86400) {
    throw new Error("Invalid rate limit.");
  }
  return transaction(async (db) => {
    const now = Date.now();
    // Serialize limiter updates so the count and key budget checks cannot race.
    await db.query("SELECT pg_advisory_xact_lock(hashtext('codesteps_rate_limits'))");
    await db.query("DELETE FROM rate_limits WHERE expires_at <= $1", [now]);
    const current = await db.query<{ count: number }>("SELECT count FROM rate_limits WHERE key = $1", [key]);
    if (current.rows[0]) {
      if (current.rows[0].count >= max) return false;
      await db.query("UPDATE rate_limits SET count = count + 1 WHERE key = $1", [key]);
      return true;
    }
    // Fail closed rather than evicting active limits when the key budget is exhausted.
    const total = await db.query<{ total: number }>("SELECT count(*)::int AS total FROM rate_limits");
    if (total.rows[0].total >= 10000) return false;
    await db.query("INSERT INTO rate_limits (key, count, expires_at) VALUES ($1, 1, $2)", [key, now + windowSeconds * 1000]);
    return true;
  });
}

export async function findAccount(username: string): Promise<AccountRecord | undefined> {
  const result = await ready().query<AccountRecord>(
    "SELECT id, name, is_guest, password_salt, password_hash FROM users WHERE username = $1 AND is_guest = 0", [username]);
  return result.rows[0] as AccountRecord | undefined;
}

async function selectSession(db: Queryable, tokenHash: string): Promise<SessionRecord | undefined> {
  const result = await db.query<{ id: string; name: string; is_guest: number; expires_at: string | number }>(`
    SELECT u.id, u.name, u.is_guest, s.expires_at FROM sessions s
    JOIN users u ON u.id = s.user_id WHERE s.token_hash = $1 AND s.expires_at > $2
  `, [tokenHash, Date.now()]);
  const row = result.rows[0];
  return row ? { user: { id: row.id, name: row.name }, isGuest: Boolean(row.is_guest), expiresAt: Number(row.expires_at) } : undefined;
}

export async function findSession(tokenHash: string): Promise<SessionRecord | undefined> {
  return selectSession(await ready(), tokenHash);
}

export async function createGuest(tokenHash: string, expiresAt: number): Promise<SessionRecord> {
  return transaction(async (db) => {
    await db.query("DELETE FROM sessions WHERE expires_at <= $1", [Date.now()]);
    await db.query("DELETE FROM users WHERE is_guest = 1 AND NOT EXISTS (SELECT 1 FROM sessions WHERE user_id = users.id)");
    const user: User = { id: randomUUID(), name: "Learner" };
    await db.query("INSERT INTO users (id, name, is_guest) VALUES ($1, $2, 1)", [user.id, user.name]);
    await db.query("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)", [tokenHash, user.id, expiresAt]);
    return { user, isGuest: true, expiresAt };
  });
}

export interface AccountSessionInput {
  account: { id: string; username: string; salt: string; passwordHash: string } | { id: string };
  oldTokenHash?: string;
  tokenHash: string;
  expiresAt: number;
}

/** Account creation, guest migration, and session rotation are one transaction. */
export async function createAccountSession(input: AccountSessionInput): Promise<SessionRecord> {
  return transaction(async (db) => {
    const { account } = input;
    if ("username" in account) {
      await db.query("INSERT INTO users (id, name, username, is_guest, password_salt, password_hash) VALUES ($1, $2, $3, 0, $4, $5)",
        [account.id, account.username, account.username, account.salt, account.passwordHash]);
    }
    // Lock both owners in stable order before migrating or modifying their courses.
    const oldSession = input.oldTokenHash ? await selectSession(db, input.oldTokenHash) : undefined;
    for (const id of [...new Set([account.id, ...(oldSession?.isGuest ? [oldSession.user.id] : [])])].sort()) {
      await db.query("SELECT id FROM users WHERE id = $1 FOR UPDATE", [id]);
    }
    const found = await db.query<User>("SELECT id, name FROM users WHERE id = $1 AND is_guest = 0", [account.id]);
    const target = found.rows[0] as User | undefined;
    if (!target) throw new Error("Account not found.");
    const previous = input.oldTokenHash ? await selectSession(db, input.oldTokenHash) : undefined;
    if (previous?.isGuest) {
      const count = await db.query("SELECT count(*)::int AS total FROM practice_courses WHERE user_id = $1 OR user_id = $2", [target.id, previous.user.id]);
      if (Number(count.rows[0].total) > 12) throw new PracticeError("Delete an older course before merging these accounts (12-course limit).", 409);
      await db.query("INSERT INTO completions (user_id, kind, item_id) SELECT $1, kind, item_id FROM completions WHERE user_id = $2 ON CONFLICT DO NOTHING",
        [target.id, previous.user.id]);
      await db.query("INSERT INTO notes (user_id, lesson_id, content, updated_at) SELECT $1, lesson_id, content, updated_at FROM notes WHERE user_id = $2 ON CONFLICT DO NOTHING",
        [target.id, previous.user.id]);
      await db.query("UPDATE practice_courses SET user_id = $1 WHERE user_id = $2", [target.id, previous.user.id]);
      await db.query("DELETE FROM users WHERE id = $1 AND is_guest = 1", [previous.user.id]);
    }
    if (input.oldTokenHash) await db.query("DELETE FROM sessions WHERE token_hash = $1", [input.oldTokenHash]);
    await db.query("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)", [input.tokenHash, target.id, input.expiresAt]);
    return { user: { id: target.id, name: target.name }, isGuest: false, expiresAt: input.expiresAt };
  });
}

export async function deleteSession(tokenHash: string): Promise<void> {
  await transaction(async (db) => {
    const session = await selectSession(db, tokenHash);
    await db.query("DELETE FROM sessions WHERE token_hash = $1", [tokenHash]);
    if (session?.isGuest) await db.query("DELETE FROM users WHERE id = $1 AND is_guest = 1", [session.user.id]);
  });
}

async function selectProgress(db: Queryable, userId: string): Promise<Progress> {
  const result = await db.query("SELECT kind, item_id FROM completions WHERE user_id = $1 ORDER BY item_id", [userId]);
  const rows = result.rows as { kind: string; item_id: string }[];
  return {
    userId,
    completedLessonIds: rows.filter((row) => row.kind === "lesson").map((row) => row.item_id),
    completedChallengeIds: rows.filter((row) => row.kind === "challenge").map((row) => row.item_id),
  };
}

export async function readProgress(userId: string): Promise<Progress> {
  return selectProgress(await ready(), userId);
}

export async function persistProgress(userId: string, kind: "lesson" | "challenge", id: string, complete: boolean): Promise<Progress> {
  return transaction(async (db) => {
    if (complete) await db.query("INSERT INTO completions (user_id, kind, item_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING", [userId, kind, id]);
    else await db.query("DELETE FROM completions WHERE user_id = $1 AND kind = $2 AND item_id = $3", [userId, kind, id]);
    return selectProgress(db, userId);
  });
}

export async function readNotes(userId: string): Promise<Map<string, Note>> {
  const result = await ready().query<Note>(
    `SELECT lesson_id AS "lessonId", user_id AS "userId", content, updated_at AS "updatedAt" FROM notes WHERE user_id = $1`, [userId]);
  return new Map((result.rows as Note[]).map((note) => [note.lessonId, note]));
}

export async function saveNote(userId: string, lessonId: string, content: string): Promise<Note> {
  const note: Note = { userId, lessonId, content, updatedAt: new Date().toISOString() };
  await (await ready()).query(`INSERT INTO notes (user_id, lesson_id, content, updated_at) VALUES ($1, $2, $3, $4)
    ON CONFLICT (user_id, lesson_id) DO UPDATE SET content = excluded.content, updated_at = excluded.updated_at`,
  [userId, lessonId, content, note.updatedAt]);
  return note;
}

export class PracticeError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

async function selectPracticeCourse(db: Queryable, userId: string, id: string, lock = false): Promise<PracticeCourse | undefined> {
  const result = await db.query<{ document: string }>(`SELECT document FROM practice_courses WHERE user_id = $1 AND id = $2${lock ? " FOR UPDATE" : ""}`, [userId, id]);
  return result.rows[0] ? JSON.parse(result.rows[0].document) as PracticeCourse : undefined;
}

export async function readPracticeCourse(userId: string, id: string): Promise<PracticeCourse | undefined> {
  return selectPracticeCourse(await ready(), userId, id);
}

export async function listPracticeCourses(userId: string): Promise<PracticeSummary[]> {
  const result = await (await ready()).query("SELECT document FROM practice_courses WHERE user_id = $1 ORDER BY seq DESC", [userId]);
  return (result.rows as { document: string }[]).map(({ document }) => {
    const course = JSON.parse(document) as PracticeCourse;
    return {
      id: course.id, title: course.title, topic: course.topic, createdAt: course.createdAt,
      lessonCount: course.lessons.length,
      completedCount: Object.values(course.entries).filter((entry) => entry.complete).length,
    };
  });
}

export async function insertPracticeCourse(userId: string, course: PracticeCourse): Promise<void> {
  await transaction(async (db) => {
    // Lock the owner row so concurrent inserts cannot exceed the per-user cap.
    await db.query("SELECT id FROM users WHERE id = $1 FOR UPDATE", [userId]);
    const count = await db.query<{ total: number }>("SELECT count(*)::int AS total FROM practice_courses WHERE user_id = $1", [userId]);
    if (count.rows[0].total >= 12) throw new PracticeError("You can save 12 courses. Delete an older course before creating another.", 409);
    await db.query("INSERT INTO practice_courses (id, user_id, document) VALUES ($1, $2, $3)", [course.id, userId, JSON.stringify(course)]);
  });
}

export async function updatePracticeCourse(userId: string, id: string, update: { additionalNotes: string } | { improvedNotes: string } | { lessonId: string; entry: PracticeEntry }): Promise<PracticeCourse> {
  return transaction(async (db) => {
    await db.query("SELECT id FROM users WHERE id = $1 FOR UPDATE", [userId]);
    const course = await selectPracticeCourse(db, userId, id, true);
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
    await db.query("UPDATE practice_courses SET document = $1 WHERE user_id = $2 AND id = $3", [JSON.stringify(course), userId, id]);
    return course;
  });
}

export async function deletePracticeCourse(userId: string, id: string): Promise<boolean> {
  const result = await (await ready()).query("DELETE FROM practice_courses WHERE user_id = $1 AND id = $2", [userId, id]);
  return (result.rowCount ?? 0) > 0;
}
