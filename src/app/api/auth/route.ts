import { getSession } from "@/server/auth";
import { failure, success } from "@/server/http";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { user, isGuest } = await getSession();
    return success({ user, isGuest });
  } catch {
    return failure("Unable to access your session. Please try again.", 503);
  }
}
