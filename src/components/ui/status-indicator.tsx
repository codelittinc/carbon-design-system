import type { ReactElement } from "react";
import { cn } from "@/lib/cn";
import { Swatch } from "./swatch";

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
  size?: "sm" | "md";
  /**
   * The browser's own hover title on the dot. Defaults on; pass `false` when
   * the indicator sits in a `Tooltip`, or the reader gets two tooltips. The
   * dot keeps its accessible name either way.
   */
  nativeTitle?: boolean;
  className?: string;
}

/**
 * A colored dot that stands for a status. The meaning is always carried by
 * `label` — as text with `showLabel`, otherwise as the dot's accessible name —
 * never by the color alone. The caller owns the status → color mapping; pair
 * it with `ChartLegend` to explain the colors once for a whole list.
 *
 * The dot is a `Swatch`, the same key the charts' legends draw.
 */
export function StatusIndicator({
  color,
  label,
  showLabel = false,
  size = "md",
  nativeTitle = true,
  className,
}: StatusIndicatorProps): ReactElement {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      {/* With the label visible the dot is decoration; without it, the dot is
          the only thing carrying the status and needs a name of its own. */}
      <Swatch
        color={color}
        size={size}
        label={showLabel ? undefined : label}
        title={nativeTitle ? label : undefined}
      />
      {showLabel && <span className="text-sm text-text-secondary">{label}</span>}
    </span>
  );
}
