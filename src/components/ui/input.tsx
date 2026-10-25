import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: ComponentProps<"input">) {
  return <input type={type} data-slot="input" className={cn("lf-input flex h-11 w-full min-w-0 rounded-lg border px-3 py-2 text-base disabled:cursor-not-allowed disabled:opacity-50", className)} {...props} />;
}

export { Input };
