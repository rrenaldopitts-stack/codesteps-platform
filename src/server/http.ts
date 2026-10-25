import { NextResponse } from "next/server";
import type { ApiResponse } from "@/lib/types";

export function success<T>(data: T) {
  return NextResponse.json<ApiResponse<T>>({ data }, { headers: { "Cache-Control": "no-store" } });
}

export function failure(error: string, status = 400) {
  return NextResponse.json<ApiResponse<never>>({ error }, { status });
}

export async function readBody(request: Request): Promise<Record<string, unknown> | null> {
  // Reject cross-origin writes and cap streamed bodies, not just Content-Length.
  const host = request.headers.get("host");
  const protocol = new URL(request.url).protocol;
  if (!host || request.headers.get("origin") !== `${protocol}//${host}`) return null;
  if (!request.headers.get("content-type")?.includes("application/json")) return null;
  const reader = request.body?.getReader();
  if (!reader) return null;
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 24000) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
    const value: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    return value !== null && typeof value === "object" && !Array.isArray(value)
      ? value as Record<string, unknown> : null;
  } catch {
    return null;
  }
}
