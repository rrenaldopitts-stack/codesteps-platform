import type { ApiResponse, NoteUpdate, ProgressUpdate } from "./types";

export async function api<T>(path: string, method = "GET", body?: NoteUpdate | ProgressUpdate): Promise<T> {
  const response = await fetch(path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const result: ApiResponse<T> = await response.json();
  if (!response.ok || result.error !== undefined) {
    throw new Error(result.error ?? "Something went wrong. Please try again.");
  }
  return result.data as T;
}
