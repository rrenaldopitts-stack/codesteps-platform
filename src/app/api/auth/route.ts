import { getSession } from "@/server/auth";
import { success } from "@/server/http";

export const runtime = "nodejs";

export async function GET() {
  const { user, isGuest } = await getSession();
  return success({ user, isGuest });
}
