"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

function Progress({ className, value = 0, ...props }: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  const percent = Math.min(100, Math.max(0, value ?? 0));
  return <ProgressPrimitive.Root data-slot="progress" className={cn("lf-progress relative h-2 w-full overflow-hidden rounded-full", className)} value={percent} {...props}>
    <ProgressPrimitive.Indicator className="lf-progress-fill h-full w-full flex-1 transition-transform" style={{ transform: `translateX(-${100 - percent}%)` }} />
  </ProgressPrimitive.Root>;
}

export { Progress };
