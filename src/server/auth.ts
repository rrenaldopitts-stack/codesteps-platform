import { createHash, randomBytes, randomUUID, scrypt, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { consumeLimit, createAccountSession, createGuest, deleteSession, findAccount, findSession, PracticeError, type SessionRecord } from "@/server/database";

const cookieName = "codesteps-session";
const accountLifetime = 60 * 60 * 24 * 7;
const guestLifetime = 60 * 60 * 24 * 30;
const hashState = globalThis as typeof globalThis & { codestepsActiveHashes?: number };

export class AuthError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

async function currentTokenHash() {
  const token = (await cookies()).get(cookieName)?.value;
  return token && /^[a-f0-9]{64}$/.test(token) ? hashToken(token) : undefined;
}

async function setSessionCookie(token: string, maxAge: number) {
  (await cookies()).set(cookieName, token, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge,
  });
}

export async function getSession(): Promise<SessionRecord> {
  const tokenHash = await currentTokenHash();
  const existing = tokenHash ? await findSession(tokenHash) : undefined;
  if (existing) return existing;
  const token = randomBytes(32).toString("hex");
  const session = await createGuest(hashToken(token), Date.now() + guestLifetime * 1000);
  await setSessionCookie(token, guestLifetime);
  return session;
}

async function derivePassword(password: string, salt: string): Promise<Buffer> {
  if ((hashState.codestepsActiveHashes ?? 0) >= 4) throw new AuthError("Sign-in is busy. Please try again shortly.", 429);
  hashState.codestepsActiveHashes = (hashState.codestepsActiveHashes ?? 0) + 1;
  try {
    return await new Promise<Buffer>((resolve, reject) => {
      scrypt(password, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });
  } finally {
    hashState.codestepsActiveHashes!--;
  }
}

export async function authenticate(body: Record<string, unknown>, register: boolean): Promise<SessionRecord> {
  // Request headers cannot supply a trustworthy remote address in this deployment.
  // Use the verified persisted session as the client bucket, with a shared fallback
  // and global ceiling so dropping cookies cannot bypass the hashing budget.
  const oldTokenHash = await currentTokenHash();
  const previous = oldTokenHash ? await findSession(oldTokenHash) : undefined;
  const clientKey = previous ? hashToken(previous.user.id) : "unidentified";
  if (!(await consumeLimit("auth:global", 100, 900)) || !(await consumeLimit(`auth:client:${clientKey}`, 12, 900))) {
    throw new AuthError("Too many attempts. Please try again later.", 429);
  }
  if (typeof body.username !== "string" || !/^[a-zA-Z0-9_]{3,32}$/.test(body.username) ||
    typeof body.password !== "string" || body.password.length < 12 || body.password.length > 128) {
    throw new AuthError(register ? "Use a 3–32 character username (letters, numbers, underscores) and a 12–128 character password." : "Invalid username or password.", register ? 400 : 401);
  }
  const username = body.username.toLowerCase();
  if (!(await consumeLimit(`auth:username:${username}`, 8, 900))) throw new AuthError("Too many attempts. Please try again later.", 429);
  const existing = await findAccount(username);
  const salt = register ? randomBytes(16).toString("hex") : existing?.password_salt ?? "codesteps-invalid-account-salt";
  const passwordHash = await derivePassword(body.password, salt);
  if (!register && (!existing?.password_hash || !timingSafeEqual(passwordHash, Buffer.from(existing.password_hash, "hex")))) {
    throw new AuthError("Invalid username or password.", 401);
  }
  if (register && existing) throw new AuthError("That username is unavailable.", 409);
  const token = randomBytes(32).toString("hex");
  let session: SessionRecord;
  try {
    session = await createAccountSession({
      account: register
        ? { id: randomUUID(), username, salt, passwordHash: passwordHash.toString("hex") }
        : { id: existing!.id },
      oldTokenHash, tokenHash: hashToken(token), expiresAt: Date.now() + accountLifetime * 1000,
    });
  } catch (error) {
    if (register && error instanceof Error && "code" in error && ["23505", "SQLITE_CONSTRAINT_UNIQUE"].includes(String(error.code))) {
      throw new AuthError("That username is unavailable.", 409);
    }
    if (error instanceof PracticeError) throw new AuthError(error.message, error.status);
    throw error;
  }
  await setSessionCookie(token, accountLifetime);
  return session;
}

export async function logout(): Promise<void> {
  const tokenHash = await currentTokenHash();
  if (tokenHash) await deleteSession(tokenHash);
  (await cookies()).delete(cookieName);
}
