import { practiceCatalog } from "./practice-catalog";
import type { PracticeLesson, PracticeTopic } from "./practice-types";

export function createPracticeLessons(topic: PracticeTopic, notes: string): PracticeLesson[] {
  const lines = notes.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  return practiceCatalog
    .filter((concept) => concept.topic === topic && concept.pattern.test(notes))
    .map(({ topic: _topic, pattern, ...lesson }) => {
      // Keep the excerpt verbatim. It is evidence of a mention, not a claim
      // that learner notes are correct or have been comprehensively understood.
      const sourceLine = lines.find((line) => pattern.test(line))!;
      return { ...lesson, sourceExcerpt: sourceLine.slice(0, 500) };
    });
}
