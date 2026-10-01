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
 * it with `StatusLegend` to explain the colors once for a whole list.
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

export interface StatusLegendItem {
  color: string;
  label: string;
}

export interface StatusLegendProps {
  items: StatusLegendItem[];
  className?: string;
}

/** A key for the colors `StatusIndicator` uses: one dot and label per status. */
export function StatusLegend({ items, className }: StatusLegendProps): ReactElement {
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-4 gap-y-2 text-sm", className)}>
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-2 text-text-secondary">
          <span
            aria-hidden="true"
            className="h-3 w-3 shrink-0 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
