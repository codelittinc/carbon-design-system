import type { ReactElement } from "react";
import { cn } from "@/lib/cn";

const sizeClasses = {
  /** 8px: a legend or tooltip key beside 12px text. */
  xs: "size-2",
  /** 12px. */
  sm: "size-3",
  /** 16px. */
  md: "size-4",
} as const;

export interface SwatchProps {
  /**
   * Any CSS color. Prefer a token reference such as `"var(--color-chart-2)"`
   * so the swatch follows the theme.
   */
  color: string;
  size?: keyof typeof sizeClasses;
  /** Faded, for a series or a status that is toggled off. */
  dimmed?: boolean;
  /**
   * Names the swatch for a screen reader (`role="img"`) when nothing beside it
   * says what the color means. Without it the swatch is decoration, hidden
   * from assistive tech, and the text next to it carries the meaning.
   */
  label?: string;
  /** The browser's hover title. */
  title?: string;
  className?: string;
}

/**
 * The round color key: a chart legend's or tooltip's series marker, a status
 * dot. Color is never the only signal — pair it with visible text, or give it
 * a `label`.
 */
export function Swatch({ color, size = "xs", dimmed = false, label, title, className }: SwatchProps): ReactElement {
  return (
    <span
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
      title={title}
      className={cn("inline-block shrink-0 rounded-full", sizeClasses[size], className)}
      style={{ backgroundColor: color, opacity: dimmed ? 0.35 : undefined }}
    />
  );
}
