import type { PracticeLesson } from "./practice-types";

export function buildStudyGuide(topic: string, lessons: PracticeLesson[]): string {
  return [
    `# ${topic}: improved study notes`,
    "Curated teaching guide for concepts mentioned in your notes. This is added material, not a verified transcription or a live AI review.",
    ...lessons.map((lesson) => [
      `## ${lesson.title}`,
      lesson.explanation,
      "Key terms:",
      ...lesson.terms.map(({ term, meaning }) => `- ${term}: ${meaning}`),
      ...(lesson.clarifications?.length ? ["Clarifications:", ...lesson.clarifications.map((item) => `- ${item}`)] : []),
      `Real-world use — ${lesson.realWorld.title}: ${lesson.realWorld.description}`,
      `Try it: ${lesson.exercise}`,
    ].join("\n")),
  ].join("\n\n");
}
