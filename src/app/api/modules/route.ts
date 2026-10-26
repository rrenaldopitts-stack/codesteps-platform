import { modules } from "@/lib/curriculum";
import { success } from "@/server/http";

export function GET() {
  return success(modules);
}
