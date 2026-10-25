export interface User {
  id: string;
  name: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  level: string;
  duration: string;
  icon: string;
  lessonIds: string[];
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  duration: string;
  introduction: string;
  steps: string[];
  task: string;
  starterCode: string;
  hint: string;
  review: string;
}

export interface Challenge {
  id: string;
  lessonId: string;
  title: string;
  description: string;
  starterCode: string;
  rubric: string[];
}

export interface Progress {
  userId: string;
  completedLessonIds: string[];
  completedChallengeIds: string[];
}

export interface Note {
  lessonId: string;
  userId: string;
  content: string;
  updatedAt: string;
}

export interface ProgressUpdate {
  kind: "lesson" | "challenge";
  id: string;
  complete: boolean;
}

export interface NoteUpdate {
  lessonId: string;
  content: string;
}

export type ApiResponse<T> =
  | { data: T; error?: never }
  | { data?: never; error: string };
