import { challenges, lessons } from "@/lib/curriculum";
import { failure, readBody, success } from "@/server/http";
import { getLearner, persistProgress } from "@/server/store";

export async function GET() {
  try {
    return success((await getLearner()).progress);
  } catch {
    return failure("Unable to load progress. Please try again.", 503);
  }
}

export async function PATCH(request: Request) {
  const body = await readBody(request);
  if (!body || typeof body.complete !== "boolean" || typeof body.id !== "string" ||
    (body.kind !== "lesson" && body.kind !== "challenge")) {
    return failure("Provide kind (lesson or challenge), id, and complete (boolean) as same-origin JSON.");
  }
  const items = body.kind === "lesson" ? lessons : challenges;
  if (!items.some((item) => item.id === body.id)) return failure("Learning item not found.", 404);
  try {
    const { user } = await getLearner();
    return success(await persistProgress(user.id, body.kind, body.id, body.complete));
  } catch {
    return failure("Unable to save progress. Please try again.", 503);
  }
}
