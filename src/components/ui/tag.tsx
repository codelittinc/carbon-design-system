import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { badgeVariants } from "./badge";
import { Button } from "./button";
import type { VariantProps } from "class-variance-authority";

interface TagProps extends VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
  /** Shows a remove button when given. */
  onRemove?: () => void;
  /** Accessible name for the remove button. Defaults to "Remove". */
  removeLabel?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * A `Badge` that can be removed — a chosen value in a multi-value field, an
 * applied filter. Shares Badge's variants, so the two sit together.
 */
export function Tag({
  children,
  variant,
  onRemove,
  removeLabel = "Remove",
  disabled,
  className,
}: TagProps) {
  return (
    <span className={cn(badgeVariants({ variant }), "gap-1 text-xs", className)}>
      {children}
      {onRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          disabled={disabled}
          aria-label={removeLabel}
          // Sized to the badge's line rather than the 32px icon button, and in
          // the tag's own colour, dimmed until hovered.
          className="-mr-1 h-4 w-4 rounded-full text-current opacity-60 hover:bg-transparent hover:text-current hover:opacity-100"
        >
          <X size={12} />
        </Button>
      )}
    </span>
  );
}
