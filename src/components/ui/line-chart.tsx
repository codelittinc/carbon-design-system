import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/cn";
import {
  CHART_GRID_COLOR,
  CHART_TICK_CATEGORY,
  CHART_TICK_VALUE,
  ChartDataTable,
  ChartEmpty,
  ChartLegend,
  ChartSkeleton,
  ChartTooltipContent,
  type ChartDatum,
  type ChartSeries,
  type ChartStateProps,
  type ChartValueFormatter,
  capSeries,
  formatChartValue,
  resolveSeriesColors,
} from "./chart";

export interface LineChartProps extends ChartStateProps {
  data: ChartDatum[];
  /** Field holding each row's position on the x axis — usually a time bucket. */
  categoryKey: string;
  /** One entry per plotted measure, colored from the palette in slot order. */
  series: ChartSeries[];
  /** Fills under each line at low opacity. Best with one series, or stacked. */
  area?: boolean;
  /** Stacks the areas into a part-to-whole total. Requires `area`. */
  stacked?: boolean;
  /**
   * `"linear"` (default) joins points honestly. `"monotone"` smooths the line,
   * which invents plausible-looking values between your real ones — reserve it
   * for genuinely continuous data.
   */
  curve?: "linear" | "monotone";
  /** Point markers. Defaults on for short series, off once they would crowd. */
  dots?: boolean;
  /** Legend visibility. Defaults on for 2+ series; a single series is named by the title. */
  legend?: boolean;
  /** Lets a legend click show/hide that series — for a many-line tracker. */
  toggleableSeries?: boolean;
  /** Draws a horizontal rule, e.g. a target or a portfolio average. */
  referenceValue?: number;
  /** Label for the reference rule. */
  referenceLabel?: string;
  height?: number;
  /** Formats tooltip values. */
  valueFormatter?: ChartValueFormatter;
  /** Formats y-axis ticks. Defaults to `valueFormatter`. */
  tickFormatter?: ChartValueFormatter;
  /** Rewrites the tooltip heading — e.g. a week key into a full date range. */
  labelFormatter?: (label: string | number) => string;
  /** Name for the x dimension, used in the accessible table. */
  categoryLabel?: string;
  tableCaption?: string;
  className?: string;
}

/**
 * Multi-series line (or area) chart: a measure tracked over time.
 *
 * ```tsx
 * <LineChart
 *   data={weeks}
 *   categoryKey="week"
 *   categoryLabel="Week"
 *   series={[
 *     { key: "leads", label: "Leads" },
 *     { key: "toursBooked", label: "Tours booked" },
 *   ]}
 * />
 * ```
 *
 * There is deliberately no second y-axis. Two measures on different scales
 * make the crossing point of the two lines meaningless — plot them as two
 * charts, or index both to a common base.
 */
export function LineChart({
  data,
  categoryKey,
  series,
  area = false,
  stacked = false,
  curve = "linear",
  dots,
  legend,
  toggleableSeries = false,
  referenceValue,
  referenceLabel,
  height = 260,
  valueFormatter = formatChartValue,
  tickFormatter,
  labelFormatter,
  categoryLabel = "Period",
  tableCaption,
  loading,
  emptyTitle,
  emptyDescription,
  className,
}: LineChartProps) {
  const allSeries = capSeries(series, "LineChart");
  const [hidden, setHidden] = React.useState<Set<string>>(() => new Set());

  /*
   * Recharts keeps chart data in a Redux store, and Redux Toolkit's immer
   * deep-freezes state in development — which would freeze the caller's own
   * array and row objects in place. Handing it a copy keeps that internal
   * detail from leaking out onto props the consumer still owns.
   */
  const plotData = React.useMemo(() => data.map((row) => ({ ...row })), [data]);

  const visibleSeries = React.useMemo(
    () => allSeries.filter((s) => !hidden.has(s.key)),
    [allSeries, hidden],
  );

  const allColors = resolveSeriesColors(allSeries);
  const showLegend = legend ?? allSeries.length > 1;
  const showDots = dots ?? data.length <= 12;
  const axisTickFormatter = tickFormatter ?? valueFormatter;

  if (loading) return <ChartSkeleton height={height} />;
  if (!data.length || !allSeries.length) {
    return <ChartEmpty height={height} title={emptyTitle} description={emptyDescription} />;
  }

  const toggle = (index: number) => {
    const key = allSeries[index]?.key;
    if (!key) return;
    setHidden((prev) => {
      const next = new Set(prev);
      // Keep at least one line plotted — an empty chart is not a useful state.
      if (next.has(key)) next.delete(key);
      else if (prev.size < allSeries.length - 1) next.add(key);
      return next;
    });
  };

  return (
    <div className={cn("w-full", className)}>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            accessibilityLayer
            data={plotData}
            margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
          >
            <CartesianGrid stroke={CHART_GRID_COLOR} vertical={false} />
            <XAxis
              dataKey={categoryKey}
              tick={CHART_TICK_CATEGORY}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={CHART_TICK_VALUE}
              tickFormatter={axisTickFormatter}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <RechartsTooltip
              cursor={{ stroke: "var(--color-text-faint)", strokeWidth: 1 }}
              content={
                <ChartTooltipContent
                  valueFormatter={valueFormatter}
                  labelFormatter={labelFormatter}
                />
              }
            />
            {referenceValue != null && (
              <ReferenceLine
                y={referenceValue}
                stroke="var(--color-text-faint)"
                strokeWidth={1}
                label={
                  referenceLabel
                    ? {
                        value: referenceLabel,
                        position: "insideTopRight",
                        fill: "var(--color-text-muted)",
                        fontSize: 10,
                      }
                    : undefined
                }
              />
            )}
            {visibleSeries.map((s) => {
              const color = allColors[allSeries.indexOf(s)];
              return (
                <Area
                  key={s.key}
                  type={curve}
                  dataKey={s.key}
                  name={s.label}
                  stroke={color}
                  strokeWidth={2}
                  fill={color}
                  fillOpacity={area ? 0.16 : 0}
                  stackId={area && stacked ? "stack" : undefined}
                  /*
                   * Open markers: surface fill, series-colored rim. A solid dot
                   * in the series color is invisible against its own line, and
                   * ringing it in the surface color cuts a notch through the
                   * line instead of marking a point. The hover dot inverts to
                   * solid, so the point under the cursor reads as selected.
                   */
                  dot={
                    showDots
                      ? { r: 3.5, fill: "var(--color-surface)", stroke: color, strokeWidth: 2 }
                      : false
                  }
                  activeDot={{ r: 4.5, fill: color, stroke: "var(--color-surface)", strokeWidth: 2 }}
                  isAnimationActive={false}
                  connectNulls
                />
              );
            })}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {showLegend && (
        <ChartLegend
          className="mt-3"
          items={allSeries.map((s, i) => ({
            label: s.label,
            color: allColors[i],
            inactive: hidden.has(s.key),
          }))}
          onItemClick={toggleableSeries ? toggle : undefined}
        />
      )}

      <ChartDataTable
        caption={tableCaption ?? `${allSeries.map((s) => s.label).join(", ")} by ${categoryLabel}`}
        categoryLabel={categoryLabel}
        categories={data.map((row) => String(row[categoryKey] ?? ""))}
        series={allSeries}
        data={data}
        valueFormatter={valueFormatter}
      />
    </div>
  );
}
