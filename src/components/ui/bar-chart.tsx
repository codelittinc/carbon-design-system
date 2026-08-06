import * as React from "react";
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/cn";
import {
  CHART_GRID_COLOR,
  CHART_LABEL_STYLE,
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

export interface BarChartProps extends ChartStateProps {
  data: ChartDatum[];
  /** Field holding each row's category name (the label axis). */
  categoryKey: string;
  /** One entry per measure. Colors come from the palette in slot order. */
  series: ChartSeries[];
  /**
   * Which way the bars run. `"vertical"` (default) stands them up from a
   * bottom baseline; `"horizontal"` lays them out from the left, which is the
   * right choice when category names are long — they get a real label column
   * instead of being rotated.
   */
  orientation?: "vertical" | "horizontal";
  /** Stacks multiple series into one bar per category instead of grouping them. */
  stacked?: boolean;
  /**
   * `"series"` (default) gives every bar of a measure the same hue — bar length
   * already encodes the value, so color is free to encode *which measure*.
   *
   * `"category"` gives each bar its own palette slot. Only reach for it when
   * the bar colors are load-bearing elsewhere on the page (a donut of the same
   * categories beside it, say). On its own it re-encodes what length already
   * shows and burns the identity channel. Single-series charts only.
   */
  colorBy?: "series" | "category";
  /**
   * Prints each bar's value at its end. Defaults on for a single series — it
   * is the relief channel that keeps lower-contrast palette slots readable —
   * and off for multiple, where a number per bar becomes noise.
   */
  valueLabels?: boolean;
  /** Legend visibility. Defaults on for 2+ series; a single series is named by the title. */
  legend?: boolean;
  /** Lets a legend click show/hide that series. */
  toggleableSeries?: boolean;
  /** Plot height in px, excluding legend. */
  height?: number;
  /** Upper bound on bar thickness in px, so few categories don't become slabs. */
  maxBarSize?: number;
  /** Formats tooltip values and data labels. */
  valueFormatter?: ChartValueFormatter;
  /** Formats value-axis ticks. Defaults to `valueFormatter`. */
  tickFormatter?: ChartValueFormatter;
  /** Rewrites the tooltip heading — e.g. a week key into a full date range. */
  labelFormatter?: (label: string | number) => string;
  /** Name for the category dimension, used in the accessible table. */
  categoryLabel?: string;
  /** Caption for the accessible table. Falls back to a generic description. */
  tableCaption?: string;
  /** Fired when a bar is clicked — for drill-down. */
  onBarClick?: (datum: ChartDatum, index: number, seriesKey: string) => void;
  className?: string;
}

/**
 * Categorical bar chart: magnitude compared across categories, or a measure
 * tracked across time buckets.
 *
 * ```tsx
 * <BarChart
 *   data={rows}
 *   categoryKey="property"
 *   series={[{ key: "leads", label: "Leads" }]}
 *   onBarClick={(row) => drillInto(row.property)}
 * />
 * ```
 *
 * Renders a visually hidden data table alongside the plot, so the values are
 * reachable by screen reader and in forced-colors mode.
 */
export function BarChart({
  data,
  categoryKey,
  series,
  orientation = "vertical",
  stacked = false,
  colorBy = "series",
  valueLabels,
  legend,
  toggleableSeries = false,
  height = 260,
  maxBarSize = 40,
  valueFormatter = formatChartValue,
  tickFormatter,
  labelFormatter,
  categoryLabel = "Category",
  tableCaption,
  onBarClick,
  loading,
  emptyTitle,
  emptyDescription,
  className,
}: BarChartProps) {
  const allSeries = capSeries(series, "BarChart");
  const [hidden, setHidden] = React.useState<Set<string>>(() => new Set());

  /*
   * Recharts keeps chart data in a Redux store, and Redux Toolkit's immer
   * deep-freezes state in development — which would freeze the caller's own
   * array and row objects in place. Handing it a copy keeps that internal
   * detail from leaking out onto props the consumer still owns. Everything
   * outside the plot (the table, click payloads) keeps using the original rows.
   */
  const plotData = React.useMemo(() => data.map((row) => ({ ...row })), [data]);

  const visibleSeries = React.useMemo(
    () => allSeries.filter((s) => !hidden.has(s.key)),
    [allSeries, hidden],
  );

  const allColors = resolveSeriesColors(allSeries);
  const isHorizontal = orientation === "horizontal";
  /*
   * Direct labels default on for a single series over a readable number of
   * bars. Past ~16 they collide and stop being read, so the axis and tooltip
   * carry the values instead — the hidden table keeps them available either way.
   */
  const showLabels = valueLabels ?? (visibleSeries.length === 1 && data.length <= 16);
  const showLegend = legend ?? allSeries.length > 1;
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
      // Keep at least one series plotted — an empty chart is not a useful state.
      if (next.has(key)) next.delete(key);
      else if (prev.size < allSeries.length - 1) next.add(key);
      return next;
    });
  };

  /* Rounded 4px cap on the data end only; the baseline end stays square. */
  const capFor = (isLastInStack: boolean): [number, number, number, number] => {
    if (stacked && !isLastInStack) return [0, 0, 0, 0];
    return isHorizontal ? [0, 4, 4, 0] : [4, 4, 0, 0];
  };

  const valueAxis = (
    <XAxis
      type="number"
      tick={CHART_TICK_VALUE}
      tickFormatter={axisTickFormatter}
      axisLine={false}
      tickLine={false}
    />
  );
  const categoryAxis = (
    <YAxis
      type="category"
      dataKey={categoryKey}
      tick={CHART_TICK_CATEGORY}
      axisLine={false}
      tickLine={false}
      width={110}
    />
  );

  return (
    <div className={cn("w-full", className)}>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            accessibilityLayer
            data={plotData}
            layout={isHorizontal ? "vertical" : "horizontal"}
            /* 2px between grouped bars so adjacent fills never touch. */
            barGap={2}
            barCategoryGap="28%"
            margin={{ top: showLabels ? 18 : 8, right: 8, bottom: 0, left: 0 }}
          >
            <CartesianGrid
              stroke={CHART_GRID_COLOR}
              horizontal={!isHorizontal}
              vertical={isHorizontal}
            />
            {isHorizontal ? (
              <>
                {valueAxis}
                {categoryAxis}
              </>
            ) : (
              <>
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
              </>
            )}
            <RechartsTooltip
              cursor={{ fill: "var(--color-surface-overlay)", fillOpacity: 0.45 }}
              content={
                <ChartTooltipContent
                  valueFormatter={valueFormatter}
                  labelFormatter={labelFormatter}
                />
              }
            />
            {visibleSeries.map((s) => {
              const seriesIndex = allSeries.indexOf(s);
              const isLastInStack = s === visibleSeries[visibleSeries.length - 1];
              const perCategory = colorBy === "category" && allSeries.length === 1;
              return (
                <Bar
                  key={s.key}
                  dataKey={s.key}
                  name={s.label}
                  fill={allColors[seriesIndex]}
                  radius={capFor(isLastInStack)}
                  /*
                   * Caps bar thickness on wide plots with few categories.
                   * Without it the bars become heavy blocks that read as loud
                   * rather than as data — thin marks, generous space.
                   */
                  maxBarSize={maxBarSize}
                  stackId={stacked ? "stack" : undefined}
                  /* A 2px surface ring keeps stacked segments visually separate. */
                  stroke={stacked ? "var(--color-surface)" : undefined}
                  strokeWidth={stacked ? 2 : 0}
                  isAnimationActive={false}
                  cursor={onBarClick ? "pointer" : undefined}
                  onClick={
                    onBarClick
                      ? (_entry: unknown, index: number) =>
                          onBarClick(data[index], index, s.key)
                      : undefined
                  }
                >
                  {perCategory &&
                    data.map((_row, i) => (
                      <Cell key={i} fill={`var(--color-chart-${Math.min(i, 7) + 1})`} />
                    ))}
                  {showLabels && (
                    <LabelList
                      dataKey={s.key}
                      position={isHorizontal ? "right" : "top"}
                      formatter={(value: unknown) =>
                        typeof value === "number" && value !== 0 ? valueFormatter(value) : ""
                      }
                      {...CHART_LABEL_STYLE}
                    />
                  )}
                </Bar>
              );
            })}
          </RechartsBarChart>
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
