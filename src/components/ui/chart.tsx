import * as React from "react";
import { cn } from "@/lib/cn";
import { Skeleton } from "./skeleton";
import { EmptyState } from "./empty-state";

/**
 * Shared foundations for the CarbonOS chart components (BarChart, LineChart,
 * DonutChart). Everything here is presentation-level: the card shell, the
 * series palette contract, the tooltip and legend, and the screen-reader table
 * that every chart renders alongside its plot.
 *
 * ── The series palette ──
 * Charts take their colors from the eight `--color-chart-*` tokens in
 * theme.css, assigned in fixed slot order and never cycled. That order is the
 * colorblind-safety mechanism (adjacent slots are validated for separation
 * under protanopia and deuteranopia), so a ninth series does NOT wrap back to
 * slot 1 — it folds into "Other", or the data gets split across two charts.
 * `seriesColor()` clamps rather than wraps to keep that guarantee.
 *
 * ── Status colors are not series colors ──
 * The success / error / warning tokens keep their reserved meaning. Don't pass
 * them as a series `color` to mean "the fourth line".
 */

/** Number of distinct categorical series the palette can encode. */
export const CHART_SERIES_LIMIT = 8;

/**
 * Color for categorical slot `index` (0-based), as a CSS variable reference so
 * it re-resolves when the theme flips between light and dark.
 *
 * Clamps at the last slot instead of cycling: a repeated hue reads as a
 * repeated entity. If you have more series than slots, fold the tail into an
 * "Other" series rather than relying on this.
 */
export function seriesColor(index: number): string {
  const slot = Math.min(Math.max(index, 0), CHART_SERIES_LIMIT - 1) + 1;
  return `var(--color-chart-${slot})`;
}

/**
 * Fill for anything the categorical palette deliberately refuses to encode —
 * a folded "Other" wedge, or categories past the eighth slot. It reads as
 * "no identity assigned" rather than as another entity, which is the honest
 * signal when the palette has run out.
 */
export const CHART_NEUTRAL_COLOR = "var(--color-text-faint)";

/** One plotted measure. `color` overrides the palette slot for this series. */
export interface ChartSeries {
  /** Key to read off each datum. */
  key: string;
  /** Human-readable name — shown in the legend, tooltip, and table view. */
  label: string;
  /** Overrides the assigned palette slot. Use a `--color-chart-*` token. */
  color?: string;
}

/** A row of chart data: the category plus one numeric field per series key. */
export type ChartDatum = Record<string, string | number | null | undefined>;

/** Resolves each series to its final color, honoring explicit overrides. */
export function resolveSeriesColors(series: ChartSeries[]): string[] {
  return series.map((s, i) => s.color ?? seriesColor(i));
}

/**
 * Caps a series list at the palette limit. Returns the kept series; anything
 * beyond the limit is dropped rather than silently recolored, and flagged in
 * development so the truncation is not invisible.
 */
export function capSeries(series: ChartSeries[], context: string): ChartSeries[] {
  if (series.length <= CHART_SERIES_LIMIT) return series;
  // Warns unconditionally: this only fires on a genuine API misuse, and a
  // silently truncated chart reads as a complete one.
  console.warn(
    `[CarbonOS ${context}] ${series.length} series given but the categorical ` +
      `palette has ${CHART_SERIES_LIMIT} slots. Showing the first ${CHART_SERIES_LIMIT} ` +
      `and dropping the rest — fold the tail into an "Other" series, or split the chart.`,
  );
  return series.slice(0, CHART_SERIES_LIMIT);
}

/** Default number formatting: grouped thousands, no forced decimals. */
export const formatChartValue = (value: number): string =>
  new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value);

export type ChartValueFormatter = (value: number) => string;

/* ────────────────────────────── Card shell ────────────────────────────── */

export interface ChartCardProps {
  /** Section heading. Names the measure so a single-series chart needs no legend. */
  title?: React.ReactNode;
  /** Supporting line under the title — a period, a caveat, a unit. */
  subtitle?: React.ReactNode;
  /** Right-aligned controls: a metric Select, a date range, a Tabs switcher. */
  action?: React.ReactNode;
  /** Rendered under the chart — a source note or a threshold key. */
  footer?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

/**
 * Titled card that a chart sits inside. Pure chrome — the chart itself owns its
 * loading and empty states, so this composes with any of them:
 *
 * ```tsx
 * <ChartCard title="Leads by property" action={<PeriodSelect />}>
 *   <BarChart data={rows} categoryKey="property" series={[{ key: "leads", label: "Leads" }]} />
 * </ChartCard>
 * ```
 */
export function ChartCard({
  title,
  subtitle,
  action,
  footer,
  className,
  children,
}: ChartCardProps) {
  return (
    <div className={cn("rounded-lg border border-border-subtle bg-surface p-4", className)}>
      {(title || subtitle || action) && (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            {title && <h3 className="text-sm font-medium text-text-primary">{title}</h3>}
            {/*
              text-secondary, not text-muted: at 12px, muted is 3.84:1 on the
              dark surface — under the 4.5:1 AA floor for normal-size text.
            */}
            {subtitle && <p className="mt-0.5 text-xs text-text-secondary">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
      {footer && <div className="mt-3 text-xs text-text-secondary">{footer}</div>}
    </div>
  );
}

/* ──────────────────────────────── Legend ──────────────────────────────── */

export interface ChartLegendItem {
  label: string;
  color: string;
  /** Renders the swatch dimmed — for a series toggled off. */
  inactive?: boolean;
}

export interface ChartLegendProps {
  items: ChartLegendItem[];
  /** Makes each entry a button. Use to toggle series visibility. */
  onItemClick?: (index: number) => void;
  className?: string;
}

/**
 * Swatch-and-label key. Identity is never carried by color alone — the label
 * beside the swatch is what a colorblind reader goes by. Text stays in the ink
 * tokens; only the swatch takes the series color.
 */
export function ChartLegend({ items, onItemClick, className }: ChartLegendProps) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-4 gap-y-1.5", className)}>
      {items.map((item, i) => {
        const content = (
          <>
            <span
              aria-hidden
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: item.color, opacity: item.inactive ? 0.35 : 1 }}
            />
            <span className={cn("truncate", item.inactive ? "text-text-faint" : "text-text-secondary")}>
              {item.label}
            </span>
          </>
        );
        return (
          <li key={`${item.label}-${i}`} className="min-w-0 text-xs">
            {onItemClick ? (
              <button
                type="button"
                onClick={() => onItemClick(i)}
                aria-pressed={!item.inactive}
                /*
                 * Negative margins pull the padding back out of the layout, so
                 * the hit target grows past the 16px text line without moving
                 * the legend. A swatch-sized target is too small to hit.
                 */
                className="-mx-1.5 -my-1 flex min-w-0 items-center gap-1.5 rounded-sm px-1.5 py-1 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {content}
              </button>
            ) : (
              <span className="flex min-w-0 items-center gap-1.5">{content}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/* ──────────────────────────────── Tooltip ─────────────────────────────── */

interface TooltipPayloadItem {
  name?: string | number;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
  payload?: Record<string, unknown>;
}

export interface ChartTooltipContentProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
  valueFormatter?: ChartValueFormatter;
  /** Rewrites the tooltip heading — e.g. a short week key into a full date. */
  labelFormatter?: (label: string | number) => string;
}

/**
 * Tooltip body. Values are monospaced so they stay column-aligned across rows,
 * matching the tabular-nums treatment used in tables.
 */
export function ChartTooltipContent({
  active,
  payload,
  label,
  valueFormatter = formatChartValue,
  labelFormatter,
}: ChartTooltipContentProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-md border border-border bg-surface-overlay px-3 py-2 shadow-lg">
      {label != null && label !== "" && (
        <p className="mb-1.5 text-xs font-medium text-text-primary">
          {labelFormatter ? labelFormatter(label) : label}
        </p>
      )}
      <ul className="space-y-1">
        {payload.map((item, i) => (
          <li key={i} className="flex items-center gap-2 text-xs">
            <span
              aria-hidden
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="mr-2 text-text-secondary">{item.name}</span>
            <span className="ml-auto font-[family-name:var(--font-mono)] text-text-primary">
              {typeof item.value === "number" ? valueFormatter(item.value) : (item.value ?? "—")}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ───────────────────────── Screen-reader table ────────────────────────── */

export interface ChartDataTableProps {
  caption: string;
  categoryLabel: string;
  categories: (string | number)[];
  series: ChartSeries[];
  data: ChartDatum[];
  valueFormatter?: ChartValueFormatter;
}

/**
 * The same numbers as a real table, visually hidden.
 *
 * This is the chart's accessible fallback: an SVG plot is unreadable to a
 * screen reader, and it doubles as the "relief channel" that makes lower-
 * contrast palette slots legitimate in light mode — the values are always
 * available in text somewhere.
 */
export function ChartDataTable({
  caption,
  categoryLabel,
  categories,
  series,
  data,
  valueFormatter = formatChartValue,
}: ChartDataTableProps) {
  return (
    <table className="sr-only">
      <caption>{caption}</caption>
      <thead>
        <tr>
          <th scope="col">{categoryLabel}</th>
          {series.map((s) => (
            <th key={s.key} scope="col">
              {s.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            <th scope="row">{String(categories[i] ?? "")}</th>
            {series.map((s) => {
              const value = row[s.key];
              return (
                <td key={s.key}>
                  {typeof value === "number" ? valueFormatter(value) : (value ?? "—")}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ─────────────────────── Loading / empty scaffolding ──────────────────── */

export interface ChartStateProps {
  loading?: boolean;
  /** Heading for the empty state shown when `data` has no rows. */
  emptyTitle?: string;
  emptyDescription?: string;
}

/** Skeleton stand-in sized to the chart's own height, to avoid layout shift. */
export function ChartSkeleton({ height }: { height: number }) {
  return <Skeleton className="w-full rounded-md" style={{ height }} />;
}

export function ChartEmpty({
  height,
  title = "No data",
  description,
}: {
  height: number;
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-center" style={{ minHeight: height }}>
      <EmptyState className="py-0" title={title} description={description} />
    </div>
  );
}

/*
 * Shared axis/grid styling, so every chart type reads as one system.
 * Value ticks are monospaced (numbers stay column-aligned, matching the
 * tabular-nums treatment in tables); category ticks are body text.
 */

/*
 * Tick text uses `text-secondary` (7.2:1 dark / 7.7:1 light), not `text-muted`
 * — muted is only 3.84:1 on the dark surface and would fail AA at this size.
 * "Recessive chrome" applies to the grid and axis rules below, not to the
 * labels a reader has to actually read.
 */

/** Tick style for a numeric axis. */
export const CHART_TICK_VALUE = {
  fill: "var(--color-text-secondary)",
  fontSize: 11,
  fontFamily: "var(--font-mono)",
} as const;

/** Tick style for a category axis. */
export const CHART_TICK_CATEGORY = {
  fill: "var(--color-text-secondary)",
  fontSize: 11,
  fontFamily: "var(--font-body)",
} as const;

/** Gridlines and axis rules — recessive, behind the data. */
export const CHART_GRID_COLOR = "var(--color-chart-grid)";

/** Direct value labels wear an ink token, never the series color. */
export const CHART_LABEL_STYLE = {
  fill: "var(--color-text-secondary)",
  fontSize: 10,
  fontFamily: "var(--font-mono)",
  fontWeight: 500,
} as const;
