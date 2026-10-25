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
  const [progress, notes] = await Promise.all([readProgress(user.id), readNotes(user.id)]);
  return { user, isGuest, progress, notes };
}
