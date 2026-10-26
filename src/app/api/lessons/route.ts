import { lessons } from "@/lib/curriculum";
import { success } from "@/server/http";

export function GET() {
  return success(lessons);
}
