"use client";

import { forwardRef } from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/cn";

const Progress = forwardRef<
  React.ComponentRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn("relative h-2 w-full overflow-hidden rounded-full bg-surface-overlay", className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full bg-accent transition-all"
      style={{ width: `${value ?? 0}%` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = "Progress";

export { Progress };
