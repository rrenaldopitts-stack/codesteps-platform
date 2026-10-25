export const practiceTopics = ["JavaScript", "HTML & CSS", "React", "APIs"] as const;
export type PracticeTopic = typeof practiceTopics[number];

export interface PracticeLesson {
  id: string;
  title: string;
  sourceExcerpt: string;
  explanation: string;
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
