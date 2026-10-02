import type { ReactElement } from "react";
import { cn } from "@/lib/cn";

const sizeClasses = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
} as const;

export interface StatusIndicatorProps {
  /**
   * Any CSS color. Prefer a token reference such as `"var(--color-chart-2)"`
   * so the dot follows the theme.
   */
  color: string;
  /** What the color means. Also the dot's accessible name and hover title. */
  label: string;
  /** Shows the label as text beside the dot. */
  showLabel?: boolean;
  size?: keyof typeof sizeClasses;
  className?: string;
}

/**
 * A colored dot that stands for a status. The meaning is always carried by
 * `label` — as text with `showLabel`, otherwise as the dot's accessible name —
 * never by the color alone. The caller owns the status → color mapping; pair
 * it with `ChartLegend` to explain the colors once for a whole list.
 */
export function StatusIndicator({
  color,
  label,
  showLabel = false,
  size = "md",
  className,
}: StatusIndicatorProps): ReactElement {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        // With the label visible the dot is decoration; without it, the dot is
        // the only thing carrying the status and needs a name of its own.
        {...(showLabel ? { "aria-hidden": true } : { role: "img", "aria-label": label })}
        title={label}
        className={cn("shrink-0 rounded-full", sizeClasses[size])}
        style={{ backgroundColor: color }}
      />
      {showLabel && <span className="text-sm text-text-secondary">{label}</span>}
    </span>
  );
}
