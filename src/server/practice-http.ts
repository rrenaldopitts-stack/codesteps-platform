import { failure } from "./http";
import { PracticeError } from "./database";
import type { PracticeEntry } from "@/lib/practice-types";
import { practiceLimits } from "@/lib/practice-types";

export function validNotes(value: unknown): value is string {
  return typeof value === "string" && value.trim().length >= 20 && value.length <= practiceLimits.submissionCharacters &&
    Buffer.byteLength(value, "utf8") <= practiceLimits.submissionBytes;
}

export function validPracticeEntry(value: unknown): value is PracticeEntry {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const entry = value as Record<string, unknown>;
  return typeof entry.answer === "string" && entry.answer.length <= 8000 &&
    typeof entry.reflection === "string" && entry.reflection.length <= 3000 &&
    typeof entry.needsPractice === "string" && entry.needsPractice.length <= 2000 &&
    typeof entry.complete === "boolean" &&
    (entry.quizChoice === null || (typeof entry.quizChoice === "number" && Number.isInteger(entry.quizChoice) && entry.quizChoice >= 0));
}

export function practiceFailure(error: unknown) {
  return error instanceof PracticeError
    ? failure(error.message, error.status)
    : failure("Could not access your course. Please retry. Your unsaved text is still in this page.", 500);
}
