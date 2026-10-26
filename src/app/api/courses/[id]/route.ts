import { getSession } from "@/server/auth";
import { deletePracticeCourse, readPracticeCourse, updatePracticeCourse } from "@/server/database";
import { failure, readBody, success } from "@/server/http";
import { practiceFailure, validNotes, validPracticeEntry } from "@/server/practice-http";
import type { PracticeEntry } from "@/lib/practice-types";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  try {
    const { id } = await params;
    const { user } = await getSession();
    const course = await readPracticeCourse(user.id, id);
    return course ? success(course) : failure("Course not found.", 404);
  } catch (error) { return practiceFailure(error); }
}

export async function PATCH(request: Request, { params }: Context) {
  const body = await readBody(request, 200000);
  if (!body) return failure("Provide a same-origin JSON update.");
  const isAppend = Object.hasOwn(body, "additionalNotes");
  const isGuide = Object.hasOwn(body, "improvedNotes");
  if (isAppend && isGuide) return failure("Send one type of update at a time.");
  if (isGuide ? typeof body.improvedNotes !== "string" || body.improvedNotes.length > 25000 :
    isAppend ? !validNotes(body.additionalNotes) :
    typeof body.lessonId !== "string" || !validPracticeEntry(body.entry)) {
    return failure(isAppend ? "Add 20–25,000 characters of notes (maximum 100 KB)." : "Provide a lessonId and a valid practice entry.");
  }
  try {
    const { id } = await params;
    const { user } = await getSession();
    const course = await (isGuide
      ? updatePracticeCourse(user.id, id, { improvedNotes: body.improvedNotes as string })
      : isAppend
      ? updatePracticeCourse(user.id, id, { additionalNotes: body.additionalNotes as string })
      : updatePracticeCourse(user.id, id, { lessonId: body.lessonId as string, entry: body.entry as PracticeEntry }));
    return success(course);
  } catch (error) { return practiceFailure(error); }
}

export async function DELETE(request: Request, { params }: Context) {
  const body = await readBody(request);
  if (body?.confirm !== true) return failure("Provide same-origin JSON with confirm: true to confirm deletion.");
  try {
    const { id } = await params;
    const { user } = await getSession();
    return await deletePracticeCourse(user.id, id) ? success({ deleted: true }) : failure("Course not found.", 404);
  } catch (error) { return practiceFailure(error); }
}
