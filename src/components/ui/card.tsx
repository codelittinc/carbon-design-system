"use client";

import { forwardRef, type ReactElement, type ReactNode } from "react";
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
 *
 * Every card in the package is this one (`StatCard` and `ChartCard` compose
 * it), so cards share one border: the `border` token. `border-subtle` is for
 * rules inside a card (table rows), not for the card's own edge.
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

interface CardHeaderProps {
  title: ReactNode;
  /** A line under the title: a period, a caveat, a count. */
  description?: ReactNode;
  /** Right-aligned controls: a button, a Select, a link. */
  actions?: ReactNode;
  /**
   * The heading element, for the page's outline. `h2` (default) for a section
   * of a page, `h3` for a card inside one. The page's own `h1` is `PageHeader`.
   */
  as?: "h2" | "h3" | "h4";
  /** `md` (default) for a section; `sm` for a compact card, a chart, a panel. */
  size?: "sm" | "md";
  className?: string;
}

/**
 * A section's heading row: the title (and a description under it) on the left,
 * actions on the right. Inside a `Card` or heading a section of a page; for the
 * page's own title use `PageHeader`.
 */
function CardHeader({
  title,
  description,
  actions,
  as: Heading = "h2",
  size = "md",
  className,
}: CardHeaderProps): ReactElement {
  return (
    <div className={cn("mb-4 flex items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        {title != null && title !== false && (
          <Heading
            className={cn(
              "text-text-primary",
              size === "sm" ? "text-sm font-medium" : "text-base font-semibold",
            )}
          >
            {title}
          </Heading>
        )}
        {/*
          text-secondary, not text-muted: at 12px, muted is 3.84:1 on the
          dark surface — under the 4.5:1 AA floor for normal-size text.
        */}
        {description && (
          <p className={cn("mt-0.5 text-text-secondary", size === "sm" ? "text-xs" : "text-sm")}>
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export { Card, CardHeader, cardVariants };
export type { CardHeaderProps };
