/**
 * What `BarChart` and `LineChart` share around their plots: the series state
 * (capped, toggleable, copied for Recharts) and the legend and screen-reader
 * table under the plot. Internal to the package, not exported.
 */

import * as React from "react";
import {
  ChartDataTable,
  ChartLegend,
  capSeries,
  resolveSeriesColors,
  type ChartDatum,
  type ChartSeries,
  type ChartValueFormatter,
} from "./chart";

export interface ChartSeriesState {
  /** The series, capped at the palette's eight slots. */
  allSeries: ChartSeries[];
  /** The series still plotted, after legend toggles. */
  visibleSeries: ChartSeries[];
  /** Each of `allSeries`' colours, by index. */
  colors: string[];
  /** Keys of the series toggled off. */
  hidden: ReadonlySet<string>;
  /** Shows or hides `allSeries[index]`, always leaving one plotted. */
  toggle: (index: number) => void;
  /** A copy of `data` for Recharts to hold. */
  plotData: ChartDatum[];
}

export function useChartSeries(
  series: ChartSeries[],
  data: ChartDatum[],
  context: string,
): ChartSeriesState {
  const allSeries = capSeries(series, context);
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

  return { allSeries, visibleSeries, colors: resolveSeriesColors(allSeries), hidden, toggle, plotData };
}

interface ChartFooterProps {
  state: ChartSeriesState;
  showLegend: boolean;
  /** Lets a legend click show or hide that series. */
  toggleable: boolean;
  data: ChartDatum[];
  categoryKey: string;
  categoryLabel: string;
  tableCaption?: string;
  valueFormatter: ChartValueFormatter;
}

/** The legend (when shown) and the visually hidden data table, under the plot. */
export function ChartFooter({
  state,
  showLegend,
  toggleable,
  data,
  categoryKey,
  categoryLabel,
  tableCaption,
  valueFormatter,
}: ChartFooterProps): React.ReactElement {
  const { allSeries, colors, hidden, toggle } = state;
  return (
    <>
      {showLegend && (
        <ChartLegend
          className="mt-3"
          items={allSeries.map((s, i) => ({
            label: s.label,
            color: colors[i],
            inactive: hidden.has(s.key),
          }))}
          onItemClick={toggleable ? toggle : undefined}
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
    </>
  );
}
