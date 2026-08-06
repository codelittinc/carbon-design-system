import * as React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { cn } from "@/lib/cn";
import {
  CHART_NEUTRAL_COLOR,
  ChartEmpty,
  ChartSkeleton,
  ChartTooltipContent,
  type ChartStateProps,
  type ChartValueFormatter,
  formatChartValue,
  seriesColor,
} from "./chart";

export interface DonutChartDatum {
  label: string;
  value: number;
  /**
   * Pins this entity's color. Worth setting when the same categories appear in
   * more than one chart, or when a filter can change how many slices there are
   * — otherwise slot assignment follows render order and the survivors repaint.
   */
  color?: string;
}

export interface DonutChartProps extends ChartStateProps {
  data: DonutChartDatum[];
  /**
   * Wedges to draw before folding the rest into a single neutral "Other".
   * Defaults to 6, which is where part-to-whole stops being readable at a
   * glance; past that a bar chart or a table serves the reader better.
   */
  maxSlices?: number;
  otherLabel?: string;
  /** Sorts descending by value. Off by default so a filter can't repaint entities. */
  sort?: boolean;
  /** `"donut"` (default) leaves a hole for the total; `"pie"` fills the circle. */
  variant?: "donut" | "pie";
  /** Big number in the hole. Defaults to the summed total. Donut variant only. */
  centerValue?: React.ReactNode;
  /** Caption under the center value. */
  centerLabel?: string;
  legendPosition?: "right" | "bottom";
  /** Shows each slice's share of the total in the legend. */
  showPercentages?: boolean;
  height?: number;
  valueFormatter?: ChartValueFormatter;
  /** Name for the category dimension, used in the accessible table. */
  categoryLabel?: string;
  tableCaption?: string;
  onSliceClick?: (datum: DonutChartDatum, index: number) => void;
  className?: string;
}

interface ResolvedSlice extends DonutChartDatum {
  color: string;
  percent: number;
}

/**
 * Part-to-whole breakdown — a channel mix, a spend split.
 *
 * ```tsx
 * <DonutChart
 *   data={[{ label: "Google", value: 412 }, { label: "Zillow", value: 288 }]}
 *   centerLabel="Total leads"
 * />
 * ```
 *
 * Use it for "roughly what share" at a glance. For comparing values that sit
 * close together, a bar chart is the honest form — the eye can compare bar
 * lengths far better than wedge angles.
 */
export function DonutChart({
  data,
  maxSlices = 6,
  otherLabel = "Other",
  sort = false,
  variant = "donut",
  centerValue,
  centerLabel,
  legendPosition = "right",
  showPercentages = true,
  height = 260,
  valueFormatter = formatChartValue,
  categoryLabel = "Category",
  tableCaption,
  onSliceClick,
  loading,
  emptyTitle,
  emptyDescription,
  className,
}: DonutChartProps) {
  const slices = React.useMemo<ResolvedSlice[]>(() => {
    const rows = sort ? [...data].sort((a, b) => b.value - a.value) : data;

    let kept: DonutChartDatum[] = rows;
    if (rows.length > maxSlices) {
      /*
       * Fold the smallest entries into one neutral bucket rather than reusing a
       * palette hue: a repeated color reads as a repeated entity. Survivors keep
       * their original order so the reader's mental map of the chart holds.
       */
      const cutoff = [...rows]
        .sort((a, b) => b.value - a.value)
        .slice(0, maxSlices - 1);
      const survivors = rows.filter((row) => cutoff.includes(row));
      const foldedTotal = rows
        .filter((row) => !cutoff.includes(row))
        .reduce((sum, row) => sum + row.value, 0);
      kept = [...survivors, { label: otherLabel, value: foldedTotal, color: CHART_NEUTRAL_COLOR }];
    }

    const total = kept.reduce((sum, row) => sum + row.value, 0);
    return kept.map((row, i) => ({
      ...row,
      color: row.color ?? seriesColor(i),
      percent: total > 0 ? (row.value / total) * 100 : 0,
    }));
  }, [data, maxSlices, otherLabel, sort]);

  const total = slices.reduce((sum, row) => sum + row.value, 0);

  if (loading) return <ChartSkeleton height={height} />;
  if (!data.length || total === 0) {
    return <ChartEmpty height={height} title={emptyTitle} description={emptyDescription} />;
  }

  const isRight = legendPosition === "right";

  return (
    /*
     * The plot is square and sized off `height`, and the whole plot+legend unit
     * centers. Letting the plot flex instead would strand a small circle in the
     * middle of a wide card, far from the legend that names its wedges.
     */
    <div
      className={cn(
        "flex w-full justify-center",
        isRight ? "items-center gap-6" : "flex-col items-center gap-4",
        className,
      )}
    >
      <div
        className="relative shrink-0"
        style={{ height, width: height, maxWidth: "100%" }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <RechartsTooltip content={<ChartTooltipContent valueFormatter={valueFormatter} />} />
            <Pie
              data={slices}
              dataKey="value"
              nameKey="label"
              innerRadius={variant === "donut" ? "62%" : 0}
              outerRadius="88%"
              /* Angular gap + a surface ring so neighboring wedges never touch. */
              paddingAngle={1}
              stroke="var(--color-surface)"
              strokeWidth={2}
              isAnimationActive={false}
              cursor={onSliceClick ? "pointer" : undefined}
              onClick={
                onSliceClick ? (_entry: unknown, index: number) => onSliceClick(slices[index], index) : undefined
              }
            >
              {slices.map((slice, i) => (
                <Cell key={`${slice.label}-${i}`} fill={slice.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {variant === "donut" && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-[family-name:var(--font-mono)] text-xl font-semibold text-text-primary">
              {centerValue ?? valueFormatter(total)}
            </span>
            {centerLabel && (
              <span className="mt-0.5 max-w-[70%] text-center text-[11px] uppercase tracking-widest text-text-secondary">
                {centerLabel}
              </span>
            )}
          </div>
        )}
      </div>

      <ul className={cn("space-y-1.5", isRight ? "w-44 shrink-0" : "w-full max-w-xs")}>
        {slices.map((slice, i) => (
          <li key={`${slice.label}-${i}`} className="flex items-center gap-2 text-xs">
            <span
              aria-hidden
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: slice.color }}
            />
            <span className="min-w-0 truncate text-text-secondary">{slice.label}</span>
            <span className="ml-auto shrink-0 font-[family-name:var(--font-mono)] text-text-primary">
              {showPercentages ? `${slice.percent.toFixed(1)}%` : valueFormatter(slice.value)}
            </span>
          </li>
        ))}
      </ul>

      <table className="sr-only">
        <caption>{tableCaption ?? `Share of total by ${categoryLabel}`}</caption>
        <thead>
          <tr>
            <th scope="col">{categoryLabel}</th>
            <th scope="col">Value</th>
            <th scope="col">Share</th>
          </tr>
        </thead>
        <tbody>
          {slices.map((slice, i) => (
            <tr key={`${slice.label}-${i}`}>
              <th scope="row">{slice.label}</th>
              <td>{valueFormatter(slice.value)}</td>
              <td>{slice.percent.toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
