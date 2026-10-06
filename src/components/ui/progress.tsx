"use client";

import { forwardRef } from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/cn";

const toneClasses = {
  accent: "bg-accent",
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-error",
  info: "bg-info",
} as const;

export type ProgressTone = keyof typeof toneClasses;

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  /**
   * The fill's color. `accent` (default) for plain progress; a status tone when
   * the amount itself is the news — complete, over, short.
   */
  tone?: ProgressTone;
}

/**
 * A bar filled to `value` (of `max`, 100 by default). A `progressbar` to
 * assistive tech: give it an `aria-label` (or `aria-labelledby`) saying what
 * is filling up.
 *
 * `value` is clamped to `[0, max]`, so 120 of 100 hours is a full bar (and
 * `aria-valuenow` 100) rather than one drawn past its track; say the overrun
 * in the text beside it. A `max` that is not above 0 is taken as 100.
 */
const Progress = forwardRef<React.ComponentRef<typeof ProgressPrimitive.Root>, ProgressProps>(
  ({ className, value, max = 100, tone = "accent", ...props }, ref) => {
    const safeMax = max > 0 ? max : 100;
    // null / undefined stay as they are: Radix reads them as indeterminate.
    const clamped = value == null ? value : Math.min(Math.max(value, 0), safeMax);
    return (
      <ProgressPrimitive.Root
        ref={ref}
        value={clamped}
        max={safeMax}
        className={cn("relative h-2 w-full overflow-hidden rounded-full bg-surface-overlay", className)}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn("h-full transition-all", toneClasses[tone])}
          style={{ width: `${((clamped ?? 0) / safeMax) * 100}%` }}
        />
      </ProgressPrimitive.Root>
    );
  },
);
Progress.displayName = "Progress";

export { Progress };
