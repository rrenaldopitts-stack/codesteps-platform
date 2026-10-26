import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Badge({ className, ...props }: ComponentProps<"span">) {
  return <span data-slot="badge" className={cn("lf-badge inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-wide", className)} {...props} />;
}

export { Badge };
