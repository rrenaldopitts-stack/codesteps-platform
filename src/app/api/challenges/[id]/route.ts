import { challenges } from "@/lib/curriculum";
import { failure, success } from "@/server/http";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const challenge = challenges.find((item) => item.id === id);
  return challenge ? success(challenge) : failure("Challenge not found.", 404);
}
