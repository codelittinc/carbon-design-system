"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/cn";

export interface SegmentedChipSegment {
  /** Any CSS color. Usually from `getCategoricalColor` / `getCategoricalSegments`. */
  color: string;
}

export interface SegmentedChipProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** At least one. Each is drawn at an equal width, left to right. */
  segments: SegmentedChipSegment[];
  label: React.ReactNode;
}

/**
 * A compact clickable chip whose fill is split into equal color bands — one
 * per category it belongs to, such as a calendar entry for someone on several
 * projects. The label is white, so the colors must be fills that hold white
 * text: the categorical palette is made for this.
 *
 * The bands are decoration. Give the chip an `aria-label` that names what the
 * colors stand for when the label alone does not.
 */
const SegmentedChip = forwardRef<HTMLButtonElement, SegmentedChipProps>(
  ({ segments, label, className, ...props }, ref) => (
    <button
      ref={ref}
      {...props}
      type="button"
      className={cn(
        "relative flex h-6 w-full shrink-0 cursor-pointer items-center overflow-hidden rounded-md px-1.5 ring-1 ring-border transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent",
        className,
      )}
    >
      <span aria-hidden="true" className="absolute inset-0 flex">
        {segments.map((segment, i) => (
          <span key={i} className="flex-1" style={{ backgroundColor: segment.color }} />
        ))}
      </span>
      <span className="relative z-10 truncate text-xs font-medium text-category-foreground text-shadow-xs">
        {label}
      </span>
    </button>
  ),
);
SegmentedChip.displayName = "SegmentedChip";

export { SegmentedChip };
