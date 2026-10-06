import type { ReactElement } from "react";
import type { VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { badgeVariants } from "./badge";
import { DismissButton } from "./dismiss-button";

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
}: TagProps): ReactElement {
  return (
    <span className={cn(badgeVariants({ variant }), "gap-1 text-xs", className)}>
      {children}
      {onRemove && (
        // Sized to the badge's line rather than the 32px icon button.
        <DismissButton size="sm" label={removeLabel} onClick={onRemove} disabled={disabled} className="-mr-1" />
      )}
    </span>
  );
}
