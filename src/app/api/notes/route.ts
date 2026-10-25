import { lessons } from "@/lib/curriculum";
import type { Note } from "@/lib/types";
import { failure, readBody, success } from "@/server/http";
import { getLearner } from "@/server/store";

export async function GET(request: Request) {
  const lessonId = new URL(request.url).searchParams.get("lessonId");
  if (!lessons.some((lesson) => lesson.id === lessonId)) return failure("Lesson not found.", 404);
  const { notes } = await getLearner();
  return success<Note | null>(notes.get(lessonId!) ?? null);
}

export async function PUT(request: Request) {
  const body = await readBody(request);
  if (!body || typeof body.lessonId !== "string" || typeof body.content !== "string" || body.content.length > 5000) {
    return failure("Provide lessonId and content (up to 5,000 characters) as same-origin JSON.");
  }
  if (!lessons.some((lesson) => lesson.id === body.lessonId)) return failure("Lesson not found.", 404);
  const { user, notes } = await getLearner();
  const note: Note = { lessonId: body.lessonId, userId: user.id, content: body.content, updatedAt: new Date().toISOString() };
  notes.set(body.lessonId, note);
  return success(note);
}
