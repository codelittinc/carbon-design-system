"use client";

import { Children, forwardRef, isValidElement, type ReactNode } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors cursor-pointer whitespace-nowrap min-w-0 [&>svg]:shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-accent text-accent-foreground hover:bg-accent-hover",
        destructive: "bg-red-600 text-white hover:bg-red-500",
        outline: "border border-border bg-transparent text-text-primary hover:bg-surface-overlay",
        ghost: "text-text-secondary hover:bg-surface-overlay hover:text-text-primary",
        link: "text-accent-text underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-7 px-2.5 text-xs",
        default: "h-8 px-3",
        lg: "h-9 px-4",
        // A fixed square, so it never gives: min-w-0 above lets a button shrink
        // in a flex row, which is right for one carrying a label and wrong for
        // one carrying a single glyph.
        icon: "h-8 w-8 shrink-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

/**
 * Puts a text label in its own element so it can truncate.
 *
 * `text-overflow` needs a block container, and a bare string passed to a flex
 * parent is an ANONYMOUS flex item — there is no element for the ellipsis to
 * apply to, so `truncate` on the button itself does nothing for it. Measured, not
 * assumed: the same label clips at the border with no ellipsis until it has a
 * wrapper of its own.
 *
 * Only strings and numbers are wrapped, which keeps an icon a SIBLING of the
 * label rather than a child of it — the `gap-2` between them is a flex gap, and
 * folding both into one span would collapse it. Elements are passed through
 * untouched, so a consumer who already wraps their own text keeps exactly the DOM
 * they wrote.
 *
 * A RUN of adjacent strings and numbers becomes ONE span. JSX splits
 * `Create {label} account` into three children, and giving each its own span
 * makes each a flex item: the spaces at their edges are dropped, so the words sit
 * a flex gap apart on screen and the accessible name reads "Createoperatingaccount".
 */
function withTruncatableLabels(children: ReactNode): ReactNode {
  const out: ReactNode[] = [];
  let run: string[] = [];
  const flush = () => {
    if (run.length === 0) return;
    out.push(
      <span key={`label-${out.length}`} className="min-w-0 truncate">
        {run.join("")}
      </span>,
    );
    run = [];
  };
  for (const child of Children.toArray(children)) {
    if (typeof child === "string" || typeof child === "number") {
      run.push(String(child));
    } else {
      flush();
      out.push(child);
    }
  }
  flush();
  return out;
}

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
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>
        {/* `asChild` hands rendering to the consumer's own element, and Slot
            requires exactly one child — wrapping would both break that contract
            and put a span inside markup somebody else owns. */}
        {asChild && isValidElement(children) ? children : withTruncatableLabels(children)}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
