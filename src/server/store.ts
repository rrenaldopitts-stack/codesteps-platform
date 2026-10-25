import type { Note, Progress, User } from "@/lib/types";
import { getSession } from "@/server/auth";
import { readNotes, readProgress } from "@/server/database";

export { persistProgress, saveNote } from "@/server/database";

export interface LearnerState {
  user: User;
  isGuest: boolean;
  progress: Progress;
  notes: Map<string, Note>;
}

export async function getLearner(): Promise<LearnerState> {
  const { user, isGuest } = await getSession();
  return { user, isGuest, progress: readProgress(user.id), notes: readNotes(user.id) };
}
