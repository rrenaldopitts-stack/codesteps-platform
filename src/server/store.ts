import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import type { Note, Progress, User } from "@/lib/types";

interface LearnerState {
  user: User;
  progress: Progress;
  notes: Map<string, Note>;
  expiresAt: number;
}

// An intentionally temporary repository. Replace this boundary with a database
// and real authentication before storing production learner data.
const globalStore = globalThis as typeof globalThis & { learners?: Map<string, LearnerState> };
const learners = globalStore.learners ??= new Map<string, LearnerState>();
const lifetime = 60 * 60 * 24;

export async function getLearner(): Promise<LearnerState> {
  const jar = await cookies();
  const sessionId = jar.get("codesteps-demo")?.value;
  const existing = sessionId ? learners.get(sessionId) : undefined;
  if (existing && existing.expiresAt > Date.now()) return existing;

  for (const [id, state] of learners) {
    if (state.expiresAt <= Date.now()) learners.delete(id);
  }
  if (learners.size >= 500) learners.delete(learners.keys().next().value!);
  const id = randomUUID();
  const state: LearnerState = {
    user: { id, name: "Learner" },
    progress: { userId: id, completedLessonIds: [], completedChallengeIds: [] },
    notes: new Map(),
    expiresAt: Date.now() + lifetime * 1000,
  };
  learners.set(id, state);
  jar.set("codesteps-demo", id, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: lifetime });
  return state;
}
