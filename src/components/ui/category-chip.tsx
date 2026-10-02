"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/cn";
import { Button } from "./button";

export interface CategoryChipSegment {
  /** Any CSS color. Usually from `getCategoricalColor` / `getCategoricalSegments`. */
  color: string;
}

export interface CategoryChipProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** At least one. Each is drawn at an equal width, left to right. */
  segments: CategoryChipSegment[];
  label: React.ReactNode;
}

/**
 * A compact clickable chip filled with the colors of the categories it belongs
 * to — one equal band each, such as a calendar entry for someone on several
 * projects. The label is white, so the colors must be fills that hold white
 * text: the categorical palette is made for this.
 *
 * A `Button` underneath, so focus, disabled and `type="button"` behave like
 * every other button. The bands are decoration: give the chip an `aria-label`
 * that names what the colors stand for when the label alone does not.
 */
const CategoryChip = forwardRef<HTMLButtonElement, CategoryChipProps>(
  ({ segments, label, className, ...props }, ref) => (
    <Button
      ref={ref}
      {...props}
      type="button"
      variant="ghost"
      size="sm"
      className={cn(
        // The bands are the fill, so the ghost hover wash and text colours give
        // way to a brightness lift and the white category foreground.
        "relative h-6 w-full justify-start overflow-hidden px-1.5 text-category-foreground ring-1 ring-border hover:bg-transparent hover:text-category-foreground hover:brightness-110",
        className,
      )}
    >
      <span aria-hidden="true" className="absolute inset-0 flex">
        {segments.map((segment, i) => (
          <span key={i} className="flex-1" style={{ backgroundColor: segment.color }} />
        ))}
      </span>
      <span className="relative z-10 min-w-0 truncate text-xs font-medium text-shadow-xs">{label}</span>
    </Button>
  ),
);
CategoryChip.displayName = "CategoryChip";

export { CategoryChip };
