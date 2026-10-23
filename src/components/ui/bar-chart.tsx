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
import { wrapLabel, wrappedLineCount } from "@/lib/wrap-label";
import {
  CHART_GRID_COLOR,
  CHART_LABEL_STYLE,
  CHART_NEUTRAL_COLOR,
  CHART_SERIES_LIMIT,
  CHART_TICK_CATEGORY,
  CHART_TICK_VALUE,
  ChartEmpty,
  ChartSkeleton,
  ChartTooltipContent,
  type ChartDatum,
  type ChartSeries,
  type ChartStateProps,
  type ChartTooltipRenderer,
  type ChartValueFormatter,
  formatChartValue,
  seriesColor,
} from "./chart";
import { ChartFooter, useChartSeries } from "./chart-series";

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
   * instead of being rotated. Up to 12 vertical bars each get their name,
   * wrapped onto up to four lines under the bar (full name on hover), when a
   * bar's slot holds 8 characters a line; otherwise the labels thin out, as
   * for a long run of dates.
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
   *
   * There are eight identity slots. Bars past the eighth render neutral rather
   * than repeating a hue — two bars in the same color read as the same entity —
   * and the overflow is logged. Sort and group the tail if you hit this.
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
  /**
   * Replaces the tooltip body, inside the standard tooltip shell, with your own
   * — e.g. the names behind a count. Gets the hovered category and each visible
   * series' value, color and full data row.
   */
  tooltipContent?: ChartTooltipRenderer;
  /** Name for the category dimension, used in the accessible table. */
  categoryLabel?: string;
  /** Caption for the accessible table. Falls back to a generic description. */
  tableCaption?: string;
  /** Fired when a bar is clicked — for drill-down. */
  onBarClick?: (datum: ChartDatum, index: number, seriesKey: string) => void;
  className?: string;
}

/*
 * Category ticks under vertical bars: 11px body text, estimated at 6.5px a
 * character so capitals and wide glyphs still fit their slot.
 */
const CATEGORY_CHAR_WIDTH = 6.5;
const CATEGORY_LINE_HEIGHT = 13;
const CATEGORY_MAX_LINES = 4;
/* Past this many bars, or under this many characters a slot, labels thin out instead. */
const WRAPPED_CATEGORY_LIMIT = 12;
const WRAPPED_CATEGORY_MIN_CHARS = 8;
/* The vertical chart's value axis and right margin: what the plot loses to them. */
const VERTICAL_VALUE_AXIS_WIDTH = 48;
const VERTICAL_RIGHT_MARGIN = 8;

/** Characters a wrapped line may hold in a bar's slot, 3px kept clear each side. */
const charsInSlot = (slot: number) => (slot - 6) / CATEGORY_CHAR_WIDTH;

interface CategoryTickProps {
  x?: number;
  y?: number;
  width?: number;
  visibleTicksCount?: number;
  payload?: { value: string | number };
}

/**
 * Every category's name under its own bar, wrapped to the bar's slot rather
 * than drawn on one line, where neighbours overlap and Recharts drops some.
 * The slot is the axis width over the number of ticks, as `interval={0}` keeps
 * them all.
 */
function WrappedCategoryTick({ x = 0, y = 0, width, visibleTicksCount, payload }: CategoryTickProps) {
  const text = String(payload?.value ?? "");
  const slot = width && visibleTicksCount ? width / visibleTicksCount : 80;
  const lines = wrapLabel(text, charsInSlot(slot), CATEGORY_MAX_LINES);
  return (
    <text x={x} y={y} textAnchor="middle" {...CHART_TICK_CATEGORY}>
      <title>{text}</title>
      {lines.map((line, i) => (
        <tspan key={i} x={x} dy={i === 0 ? "0.9em" : CATEGORY_LINE_HEIGHT}>
          {line}
        </tspan>
      ))}
    </text>
  );
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
  tooltipContent,
  categoryLabel = "Category",
  tableCaption,
  onBarClick,
  loading,
  emptyTitle,
  emptyDescription,
  className,
}: BarChartProps): React.ReactElement {
  const seriesState = useChartSeries(series, data, "BarChart");
  const { allSeries, visibleSeries, colors: allColors, plotData } = seriesState;
  const isHorizontal = orientation === "horizontal";
  const perCategory = colorBy === "category" && allSeries.length === 1;

  /*
   * Per-category fills. Past the eighth slot the palette is out of identity
   * hues, so the tail takes the neutral rather than repeating a hue — two bars
   * in the same color read as the same entity, which is exactly the confusion
   * this mode exists to avoid. Memoized so the warning fires when the data
   * changes, not on every render.
   */
  const categoryColors = React.useMemo(() => {
    if (!perCategory) return null;
    if (data.length > CHART_SERIES_LIMIT) {
      console.warn(
        `[CarbonOS BarChart] colorBy="category" with ${data.length} categories, but the ` +
          `palette has ${CHART_SERIES_LIMIT} identity slots. Bars past the ${CHART_SERIES_LIMIT}th ` +
          `render neutral. Sort and group the tail, or drop back to colorBy="series".`,
      );
    }
    return data.map((_row, i) => (i < CHART_SERIES_LIMIT ? seriesColor(i) : CHART_NEUTRAL_COLOR));
  }, [perCategory, data]);
  /*
   * Direct labels default on for a single series over a readable number of
   * bars. Past ~16 they collide and stop being read, so the axis and tooltip
   * carry the values instead — the hidden table keeps them available either way.
   */
  const showLabels = valueLabels ?? (visibleSeries.length === 1 && data.length <= 16);
  const showLegend = legend ?? allSeries.length > 1;
  const axisTickFormatter = tickFormatter ?? valueFormatter;
  /*
   * Vertical bars wrap their names when each bar's slot holds a readable line:
   * the plot is the container less the value axis and margin, over the bars.
   * Unmeasured, too many bars or too narrow, the ticks thin out as before.
   */
  const [chartWidth, setChartWidth] = React.useState(0);
  const slotChars =
    chartWidth > 0
      ? charsInSlot((chartWidth - VERTICAL_VALUE_AXIS_WIDTH - VERTICAL_RIGHT_MARGIN) / data.length)
      : 0;
  const wrapCategories =
    !isHorizontal && data.length <= WRAPPED_CATEGORY_LIMIT && slotChars >= WRAPPED_CATEGORY_MIN_CHARS;
  /* Room under the bars for the lines the longest name actually wraps to. */
  const categoryAxisHeight = React.useMemo(() => {
    if (!wrapCategories) return undefined;
    const labels = data.map((row) => String(row[categoryKey] ?? ""));
    return 10 + wrappedLineCount(labels, slotChars, CATEGORY_MAX_LINES) * CATEGORY_LINE_HEIGHT;
  }, [wrapCategories, data, categoryKey, slotChars]);

  /*
   * Horizontal bars put their value labels at the bar's right end, and the
   * value axis puts its last tick on the right edge — both need room that a
   * vertical chart spends on `top` instead. Without it, a bar that reaches the
   * axis maximum has its label clipped by the SVG viewport. Sized off the
   * widest label actually rendered (10px mono ≈ 6.5px per character), with a
   * floor that covers the overhang of the final axis tick.
   */
  const rightGutter = React.useMemo(() => {
    if (!isHorizontal) return VERTICAL_RIGHT_MARGIN;
    const widest = showLabels
      ? data.reduce((max, row) => {
          const rowMax = allSeries.reduce((m, s) => {
            const value = row[s.key];
            return typeof value === "number" && value !== 0
              ? Math.max(m, valueFormatter(value).length)
              : m;
          }, 0);
          return Math.max(max, rowMax);
        }, 0)
      : 0;
    return Math.max(40, Math.ceil(widest * 6.5) + 10);
  }, [isHorizontal, showLabels, data, allSeries, valueFormatter]);

  if (loading) return <ChartSkeleton height={height} />;
  if (!data.length || !allSeries.length) {
    return <ChartEmpty height={height} title={emptyTitle} description={emptyDescription} />;
  }

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
        <ResponsiveContainer
          width="100%"
          height="100%"
          onResize={isHorizontal ? undefined : (width) => setChartWidth(width)}
        >
          <RechartsBarChart
            accessibilityLayer
            data={plotData}
            layout={isHorizontal ? "vertical" : "horizontal"}
            /* 2px between grouped bars so adjacent fills never touch. */
            barGap={2}
            barCategoryGap="28%"
            margin={{
              top: !isHorizontal && showLabels ? 18 : 8,
              right: rightGutter,
              bottom: 0,
              left: 0,
            }}
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
                  tick={wrapCategories ? <WrappedCategoryTick /> : CHART_TICK_CATEGORY}
                  axisLine={false}
                  tickLine={false}
                  interval={wrapCategories ? 0 : "preserveStartEnd"}
                  height={categoryAxisHeight}
                />
                <YAxis
                  tick={CHART_TICK_VALUE}
                  tickFormatter={axisTickFormatter}
                  axisLine={false}
                  tickLine={false}
                  width={VERTICAL_VALUE_AXIS_WIDTH}
                />
              </>
            )}
            <RechartsTooltip
              cursor={{ fill: "var(--color-surface-overlay)", fillOpacity: 0.45 }}
              content={
                <ChartTooltipContent
                  valueFormatter={valueFormatter}
                  labelFormatter={labelFormatter}
                  render={tooltipContent}
                />
              }
            />
            {visibleSeries.map((s) => {
              const seriesIndex = allSeries.indexOf(s);
              const isLastInStack = s === visibleSeries[visibleSeries.length - 1];
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
                  {categoryColors?.map((fill, i) => <Cell key={i} fill={fill} />)}
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

      <ChartFooter
        state={seriesState}
        showLegend={showLegend}
        toggleable={toggleableSeries}
        data={data}
        categoryKey={categoryKey}
        categoryLabel={categoryLabel}
        tableCaption={tableCaption}
        valueFormatter={valueFormatter}
      />
    </div>
  );
}
