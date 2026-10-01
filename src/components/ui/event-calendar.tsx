"use client";

import { Fragment, useMemo, type ReactElement, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { daysInMonth, monthLabel, shiftMonth, type YearMonth } from "@/lib/calendar";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Spinner } from "./spinner";

export interface EventCalendarProps<T> {
  /** The month shown, as "YYYY-MM". Controlled. */
  month: string;
  onMonthChange: (month: string) => void;
  /** Items keyed by "YYYY-MM-DD", each list already in display order. */
  itemsByDate: ReadonlyMap<string, T[]>;
  renderItem: (item: T, isoDate: string) => ReactNode;
  itemKey: (item: T, isoDate: string) => string | number;
  /** Items shown in a day before the rest fold into "+N more". Defaults to 3. */
  maxVisibleItems?: number;
  /** Dims the grid under a spinner and disables the month controls. */
  loading?: boolean;
  /** Heading of the "+N more" list. Defaults to "Tue, Jul 14 — 5 items". */
  overflowPopoverTitle?: (isoDate: string, count: number) => ReactNode;
  /**
   * Accessible name of the "+N more" button; `count` is the hidden items.
   * Defaults to "Show 2 more items on July 14".
   */
  overflowAriaLabel?: (isoDate: string, count: number) => string;
  /** Accessible name of the grid. Defaults to "Calendar, July 2026". */
  ariaLabel?: string;
  className?: string;
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** "2026-07" → { year: 2026, month: 7 }. */
function parseMonth(month: string): YearMonth {
  const [year, m] = month.split("-").map(Number);
  return { year, month: m };
}

function formatMonth({ year, month }: YearMonth): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function format(date: Date, options: Intl.DateTimeFormatOptions): string {
  return date.toLocaleDateString("en-US", { ...options, timeZone: "UTC" });
}

/**
 * A month of days with items in them — who is off, what is due — drawn as a
 * Sunday-first grid. Each day shows up to `maxVisibleItems`, then a "+N more"
 * button that lists all of that day's items in a popover. Items are whatever
 * `renderItem` draws, usually a `SegmentedChip` or a `Badge`.
 *
 * The month is computed in UTC, so the grid does not depend on the reader's
 * zone. Use `MonthCalendar` instead to PICK a day.
 */
export function EventCalendar<T>({
  month,
  onMonthChange,
  itemsByDate,
  renderItem,
  itemKey,
  maxVisibleItems = 3,
  loading = false,
  overflowPopoverTitle,
  overflowAriaLabel,
  ariaLabel,
  className,
}: EventCalendarProps<T>): ReactElement {
  const todayIso = new Date().toISOString().slice(0, 10);
  const currentMonth = todayIso.slice(0, 7);
  const shown = parseMonth(month);
  const monthTitle = monthLabel(shown);

  const cells = useMemo(() => {
    const { year, month: m } = parseMonth(month);
    const firstDow = new Date(Date.UTC(year, m - 1, 1)).getUTCDay();
    const total = Math.ceil((firstDow + daysInMonth(year, m)) / 7) * 7;
    return Array.from({ length: total }, (_, i) => {
      // Day offsets past either end of the month roll into its neighbours.
      const date = new Date(Date.UTC(year, m - 1, 1 - firstDow + i));
      const dow = date.getUTCDay();
      return {
        date,
        iso: date.toISOString().slice(0, 10),
        inMonth: date.getUTCMonth() === m - 1,
        isWeekend: dow === 0 || dow === 6,
      };
    });
  }, [month]);

  const titleOf =
    overflowPopoverTitle ??
    ((isoDate: string, count: number) =>
      `${format(new Date(`${isoDate}T00:00:00Z`), { weekday: "short", month: "short", day: "numeric" })} — ${count} ${count === 1 ? "item" : "items"}`);
  const ariaLabelOf =
    overflowAriaLabel ??
    ((isoDate: string, count: number) =>
      `Show ${count} more items on ${format(new Date(`${isoDate}T00:00:00Z`), { month: "long", day: "numeric" })}`);

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
        <h2 className="text-lg font-semibold text-text-primary" aria-live="polite">
          {monthTitle}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={month === currentMonth || loading}
            onClick={() => onMonthChange(currentMonth)}
          >
            Today
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Previous month"
            disabled={loading}
            onClick={() => onMonthChange(formatMonth(shiftMonth(shown, -1)))}
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Next month"
            disabled={loading}
            onClick={() => onMonthChange(formatMonth(shiftMonth(shown, 1)))}
          >
            <ChevronRight size={16} aria-hidden="true" />
          </Button>
        </div>
      </div>

      <div className="relative pt-4">
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-bg/60">
            <Spinner size="sm" />
          </div>
        )}

        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            <div className="grid grid-cols-7">
              {WEEKDAY_LABELS.map((label) => (
                <div
                  key={label}
                  className="py-2 text-center text-xs font-medium uppercase tracking-wider text-text-muted"
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Weeks are role="row" so the grid structure is valid: grid > row > gridcell. */}
            <div
              role="grid"
              aria-label={ariaLabel ?? `Calendar, ${monthTitle}`}
              className="divide-y divide-border overflow-hidden rounded-lg border border-border"
            >
              {Array.from({ length: cells.length / 7 }, (_, week) => (
                <div key={week} role="row" className="grid grid-cols-7 divide-x divide-border">
                  {cells.slice(week * 7, week * 7 + 7).map((cell) => {
                    const items = cell.inMonth ? itemsByDate.get(cell.iso) || [] : [];
                    const visible = items.slice(0, maxVisibleItems);
                    const overflow = items.length - visible.length;
                    const isToday = cell.inMonth && cell.iso === todayIso;

                    return (
                      <div
                        key={cell.iso}
                        role="gridcell"
                        aria-label={format(cell.date, { weekday: "long", month: "long", day: "numeric" })}
                        aria-current={isToday ? "date" : undefined}
                        className={cn(
                          "flex min-h-[96px] flex-col gap-1 p-1.5 lg:min-h-[112px]",
                          !cell.inMonth ? "bg-bg" : cell.isWeekend ? "bg-surface-raised" : "bg-surface",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-5 w-5 items-center justify-center rounded-full text-xs tabular-nums",
                            isToday
                              ? "bg-accent font-semibold text-accent-foreground"
                              : cell.inMonth
                                ? "font-medium text-text-secondary"
                                : "font-medium text-text-faint",
                          )}
                        >
                          {cell.date.getUTCDate()}
                        </span>

                        {visible.map((item) => (
                          <Fragment key={itemKey(item, cell.iso)}>{renderItem(item, cell.iso)}</Fragment>
                        ))}

                        {overflow > 0 && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                aria-label={ariaLabelOf(cell.iso, overflow)}
                                className="h-6 w-full justify-start px-1.5 text-text-muted"
                              >
                                {/* One string: Button wraps each text child in its own span. */}
                                {`+${overflow} more`}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              align="start"
                              aria-label={`Items on ${format(cell.date, { month: "long", day: "numeric" })}`}
                              className="max-h-64 w-64 space-y-1 overflow-y-auto p-2"
                            >
                              <div className="pb-1 text-xs font-semibold text-text-secondary">
                                {titleOf(cell.iso, items.length)}
                              </div>
                              {items.map((item) => (
                                <Fragment key={itemKey(item, cell.iso)}>
                                  {renderItem(item, cell.iso)}
                                </Fragment>
                              ))}
                            </PopoverContent>
                          </Popover>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
