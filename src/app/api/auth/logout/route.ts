import { logout } from "@/server/auth";
import { failure, readBody, success } from "@/server/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!await readBody(request)) return failure("Send same-origin JSON to sign out.");
  try {
    await logout();
    return success({ signedOut: true });
  } catch {
    return failure("Unable to sign out right now. Please try again.", 503);
  }
}
