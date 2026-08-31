"use client";

import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-accent text-carbon-950 hover:bg-accent-hover",
        destructive: "bg-red-600 text-white hover:bg-red-500",
        outline: "border border-border bg-transparent text-text-primary hover:bg-surface-overlay",
        ghost: "text-text-secondary hover:bg-surface-overlay hover:text-text-primary",
        link: "text-accent-text underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-7 px-2.5 text-xs",
        default: "h-8 px-3",
        lg: "h-9 px-4",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

/**
 * A button.
 *
 * **Inside a `<form>`, pass `type` explicitly.** This renders a bare `<button>`
 * and sets no default type, which is HTML's own rule and the same one shadcn and
 * every other headless kit follow — so an unmarked button in a form is
 * `type="submit"`. A button that opens a dialog, clears a field or pages a
 * calendar therefore needs `type="button"`, and the one that saves needs
 * `type="submit"`.
 *
 * This is not defaulted to `"button"` on purpose. Flipping it would silently
 * stop every form whose submit relies on the default, in apps pinned to a SHA
 * that cannot see the change in their diff — the same class of silent failure,
 * pointed the other way, and not one a component library should introduce to
 * save an attribute. `MonthCalendar` marks all three of its buttons for exactly
 * this reason; see the note there for what happened when it did not.
 */

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
