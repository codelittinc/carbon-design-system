"use client";

import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const cardVariants = cva("rounded-lg border border-border bg-surface", {
  variants: {
    padding: {
      none: "",
      sm: "p-3",
      md: "p-4 sm:p-5",
      lg: "p-6 sm:p-10",
    },
    hoverable: {
      true: "transition-colors hover:border-text-faint hover:bg-surface-raised",
      false: "",
    },
  },
  defaultVariants: {
    padding: "md",
    hoverable: false,
  },
});

interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /**
   * Merge the card's styles onto the single child instead of rendering a
   * `<div>` — for a card that is itself a link (`<Card asChild><a …/></Card>`).
   */
  asChild?: boolean;
}

/**
 * A bordered surface that groups related content. `padding` picks a step on the
 * spacing scale; `hoverable` adds a hover state for cards that are clickable.
 */
const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, padding, hoverable, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";
    return (
      <Comp ref={ref} className={cn(cardVariants({ padding, hoverable }), className)} {...props} />
    );
  },
);
Card.displayName = "Card";

export { Card, cardVariants };
