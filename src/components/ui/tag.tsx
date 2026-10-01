import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { badgeVariants } from "./badge";
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
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          aria-label={removeLabel}
          className="-mr-0.5 rounded-full opacity-60 transition-opacity hover:opacity-100 disabled:pointer-events-none"
        >
          <X size={12} />
        </button>
      )}
    </span>
  );
}
