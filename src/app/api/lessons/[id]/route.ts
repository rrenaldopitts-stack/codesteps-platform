import { lessons } from "@/lib/curriculum";
import { failure, success } from "@/server/http";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const lesson = lessons.find((item) => item.id === id);
  return lesson ? success(lesson) : failure("Lesson not found.", 404);
}
