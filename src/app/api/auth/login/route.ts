import { handleAuthentication } from "@/server/auth-route";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return handleAuthentication(request, false);
}
