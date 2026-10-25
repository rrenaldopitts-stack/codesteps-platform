export const practiceTopics = ["JavaScript", "HTML & CSS", "React", "APIs"] as const;
export type PracticeTopic = typeof practiceTopics[number];

export const practiceLimits = {
  submissionCharacters: 25000,
  submissionBytes: 100000,
  totalCharacters: 100000,
  totalBytes: 200000,
} as const;

export interface PracticeLesson {
  id: string;
  title: string;
  sourceExcerpt: string;
  explanation: string;
  clarifications?: string[];
  terms: { term: string; meaning: string }[];
  realWorld: { title: string; description: string };
  exercise: string;
  starterCode: string;
  hints: string[];
  sampleAnswer: string;
  rubric: string[];
  quiz: { question: string; choices: string[]; answerIndex: number; explanation: string };
}

export interface PracticeEntry {
  answer: string;
  quizChoice: number | null;
  reflection: string;
  needsPractice: string;
  complete: boolean;
}

export interface PracticeCourse {
  id: string;
  title: string;
  topic: PracticeTopic;
  sourceNotes: string;
  improvedNotes?: string;
  createdAt: string;
  lessons: PracticeLesson[];
  entries: Record<string, PracticeEntry>;
}

export type PracticeSummary = Pick<PracticeCourse, "id" | "title" | "topic" | "createdAt"> & {
  lessonCount: number;
  completedCount: number;
};

export interface CreatePracticeRequest {
  topic: PracticeTopic;
  notes: string;
}

export interface SavePracticeRequest {
  lessonId: string;
  entry: PracticeEntry;
}

export interface SaveImprovedNotesRequest {
  improvedNotes: string;
}
