"use client";

/**
 * The small X that dismisses something: a tag, an alert, a toast, a dialog.
 * Internal to the package, not exported.
 */

import { forwardRef, type ButtonHTMLAttributes, type ReactElement } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "./button";

interface DismissButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** The accessible name: "Remove", "Dismiss", "Close". */
  label: string;
  /** `sm` fits a badge's line; `md` an alert, a toast or a dialog. */
  size?: "sm" | "md";
}

/**
 * A ghost icon `Button` in its surroundings' own colour, dimmed until hovered,
 * so it reads on every tone's tint. Always `type="button"`: it is never a
 * form's submit.
 */
export const DismissButton = forwardRef<HTMLButtonElement, DismissButtonProps>(
  ({ label, size = "md", className, ...props }, ref) => (
    <Button
      ref={ref}
      type="button"
      variant="ghost"
      size="icon"
      aria-label={label}
      className={cn(
        "text-current opacity-70 hover:bg-transparent hover:text-current hover:opacity-100",
        size === "sm" ? "h-4 w-4 rounded-full" : "h-6 w-6",
        className,
      )}
      {...props}
    >
      <X size={size === "sm" ? 12 : 14} aria-hidden="true" />
    </Button>
  ),
);
DismissButton.displayName = "DismissButton";

/**
 * The close X in the corner of a Dialog or a Sheet. Radix's `Close` with a
 * real, named button inside, so a screen reader announces "Close, button"
 * rather than an unnamed one.
 */
export function CloseButton({ className }: { className?: string }): ReactElement {
  return (
    <DialogPrimitive.Close asChild>
      <DismissButton label="Close" className={cn("absolute right-4 top-4", className)} />
    </DialogPrimitive.Close>
  );
}
