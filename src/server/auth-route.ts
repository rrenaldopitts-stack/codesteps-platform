import { authenticate, AuthError } from "@/server/auth";
import { failure, readBody, success } from "@/server/http";

export async function handleAuthentication(request: Request, register: boolean) {
  const body = await readBody(request);
  if (!body) return failure("Provide username and password as same-origin JSON.");
  try {
    const { user, isGuest } = await authenticate(body, register);
    return success({ user, isGuest });
  } catch (error) {
    if (error instanceof AuthError) return failure(error.message, error.status);
    return failure("Unable to sign in right now. Please try again.", 503);
  }
}
