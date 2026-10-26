import { randomUUID } from "node:crypto";
import { createPracticeLessons } from "@/lib/practice-generator";
import { practiceTopics, type PracticeCourse, type PracticeTopic } from "@/lib/practice-types";
import { consumeLimit, insertPracticeCourse, listPracticeCourses } from "@/server/database";
import { getSession } from "@/server/auth";
import { failure, readBody, success } from "@/server/http";
import { practiceFailure, validNotes } from "@/server/practice-http";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { user } = await getSession();
    return success(await listPracticeCourses(user.id));
  } catch (error) { return practiceFailure(error); }
}

export async function POST(request: Request) {
  const body = await readBody(request, 200000);
  if (!body || !practiceTopics.includes(body.topic as PracticeTopic) || !validNotes(body.notes)) {
    return failure("Choose a supported topic and provide 20–25,000 characters of notes (maximum 100 KB) as same-origin JSON.");
  }
  const topic = body.topic as PracticeTopic;
  const lessons = createPracticeLessons(topic, body.notes);
  if (!lessons.length) return failure("No supported concepts found for this topic. Try the sample notes, choose another topic, or mention a supported concept listed in the form.");
  try {
    const { user } = await getSession();
    if (!(await consumeLimit(`courses:${user.id}`, 20, 3600))) return failure("Course creation limit reached. Please try again later.", 429);
    const course: PracticeCourse = {
      id: randomUUID(), title: `${topic} practice from your notes`,
      topic, sourceNotes: body.notes, lessons, entries: {}, createdAt: new Date().toISOString(),
    };
    await insertPracticeCourse(user.id, course);
    return success(course);
  } catch (error) { return practiceFailure(error); }
}
