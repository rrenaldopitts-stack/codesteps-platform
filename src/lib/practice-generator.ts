import { practiceCatalog } from "./practice-catalog";
import type { PracticeLesson, PracticeTopic } from "./practice-types";

export function createPracticeLessons(topic: PracticeTopic, notes: string): PracticeLesson[] {
  return practiceCatalog
    .filter((concept) => concept.topic === topic && concept.pattern.test(notes))
    .map((concept) => {
      // Keep the excerpt verbatim. It is evidence of a mention, not a claim
      // that learner notes are correct or have been comprehensively understood.
      const match = notes.match(concept.pattern)!;
      const offset = match.index ?? 0;
      const start = Math.max(notes.lastIndexOf("\n", Math.max(0, offset - 1)) + 1, offset - 120);
      const nextNewline = notes.indexOf("\n", offset + match[0].length);
      const sourceExcerpt = notes.slice(start, nextNewline < 0 ? notes.length : nextNewline).slice(0, 500);
      return {
        id: concept.id, title: concept.title, sourceExcerpt,
        explanation: concept.explanation, clarifications: concept.clarifications,
        terms: concept.terms, realWorld: concept.realWorld,
        exercise: concept.exercise, starterCode: concept.starterCode, hints: concept.hints,
        sampleAnswer: concept.sampleAnswer, rubric: concept.rubric, quiz: concept.quiz,
      };
    });
}
