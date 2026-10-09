import type { ReactElement } from "react";
import { cn } from "@/lib/cn";

interface ProductMarkProps {
  /** The product's name, drawn in the display font beside the square. */
  name: string;
  /** The letter in the accent square. Defaults to the first letter of `name`. */
  initial?: string;
  /**
   * Only the square, for an icon rail. The name stays in the DOM as
   * screen-reader text, so a link around a compact mark is still named.
   */
  compact?: boolean;
  className?: string;
}

/**
 * The Carbon product mark: an accent square with the product's initial, and
 * the name in the display font. Every Carbon app draws its sidebar header and
 * its signed-out / access-denied screen with it, so the apps look like one
 * family and a page outside the shell still says which app it belongs to.
 */
export function ProductMark({
  name,
  initial,
  compact = false,
  className,
}: ProductMarkProps): ReactElement {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        aria-hidden="true"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent text-sm font-bold text-accent-foreground"
      >
        {(initial ?? name.charAt(0)).toUpperCase()}
      </span>
      <span
        className={
          compact
            ? "sr-only"
            : "font-[family-name:var(--font-display)] text-lg tracking-tight text-text-primary"
        }
      >
        {name}
      </span>
    </span>
  );
}
