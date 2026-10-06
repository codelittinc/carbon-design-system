"use client";

import { Fragment, type ReactElement, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import {
  compareMonths,
  dateKey,
  formatCalendarDate,
  formatDateKey,
  monthLabel,
  shiftMonth,
  todayIn,
  type YearMonth,
} from "@/lib/calendar";
import { Button } from "./button";
import { MonthGrid, PeriodNav } from "./calendar-chrome";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Spinner } from "./spinner";

export interface EventCalendarProps<T> {
  /** The month shown. Controlled, like `MonthCalendar`'s. */
  month: YearMonth;
  onMonthChange: (month: YearMonth) => void;
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
  /** Accessible name of the table. Defaults to "Calendar, July 2026". */
  ariaLabel?: string;
  className?: string;
}

/**
 * A month of days with items in them — who is off, what is due — drawn as a
 * Monday-first grid. Each day shows up to `maxVisibleItems`, then a "+N more"
 * button that lists all of that day's items in a popover. Items are whatever
 * `renderItem` draws, usually a `CategoryChip` or a `Badge`.
 *
 * The grid is `monthWeeks` from `lib/calendar`, the same layout `MonthCalendar`
 * draws, so it does not depend on the reader's zone. Use `MonthCalendar`
 * instead to PICK a day.
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
  const today = todayIn();
  const todayKey = dateKey(today);
  const currentMonth: YearMonth = { year: today.year, month: today.month };
  const monthTitle = monthLabel(month);

  const titleOf =
    overflowPopoverTitle ??
    ((isoDate: string, count: number) =>
      `${formatDateKey(isoDate, { weekday: "short", month: "short", day: "numeric" })} — ${count} ${count === 1 ? "item" : "items"}`);
  const ariaLabelOf =
    overflowAriaLabel ??
    ((isoDate: string, count: number) =>
      `Show ${count} more items on ${formatDateKey(isoDate, { month: "long", day: "numeric" })}`);

  return (
    <div className={className}>
      <PeriodNav
        className="border-b border-border pb-4"
        label={monthTitle}
        onPrevious={() => onMonthChange(shiftMonth(month, -1))}
        onNext={() => onMonthChange(shiftMonth(month, 1))}
        onToday={() => onMonthChange(currentMonth)}
        previousLabel="Previous month"
        nextLabel="Next month"
        todayDisabled={compareMonths(month, currentMonth) === 0}
        disabled={loading}
      />

      <div className="relative pt-4">
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-bg/60">
            <Spinner size="sm" />
          </div>
        )}

        <div className="overflow-x-auto">
          <MonthGrid
            className="min-w-[700px]"
            month={month}
            ariaLabel={ariaLabel ?? `Calendar, ${monthTitle}`}
            today={todayKey}
            dayClassName={(_date, day) =>
              cn(
                "flex min-h-[96px] flex-col gap-1 p-1.5 lg:min-h-[112px]",
                day.isWeekend ? "bg-surface-raised" : "bg-surface",
              )
            }
            renderDay={(cell, { key: iso, isToday }) => {
              const items = itemsByDate.get(iso) || [];
              const visible = items.slice(0, maxVisibleItems);
              const overflow = items.length - visible.length;
              return (
                <>
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full text-xs tabular-nums",
                      isToday
                        ? "bg-accent font-semibold text-accent-foreground"
                        : "font-medium text-text-secondary",
                    )}
                  >
                    {cell.day}
                  </span>

                  {visible.map((item) => (
                    <Fragment key={itemKey(item, iso)}>{renderItem(item, iso)}</Fragment>
                  ))}

                  {overflow > 0 && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          aria-label={ariaLabelOf(iso, overflow)}
                          className="h-6 w-full justify-start px-1.5 text-text-muted"
                        >
                          {/* One string: Button wraps each text child in its own span. */}
                          {`+${overflow} more`}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        align="start"
                        aria-label={`Items on ${formatCalendarDate(cell, { month: "long", day: "numeric" })}`}
                        className="max-h-64 w-64 space-y-1 overflow-y-auto p-2"
                      >
                        <div className="pb-1 text-xs font-semibold text-text-secondary">
                          {titleOf(iso, items.length)}
                        </div>
                        {items.map((item) => (
                          <Fragment key={itemKey(item, iso)}>
                            {renderItem(item, iso)}
                          </Fragment>
                        ))}
                      </PopoverContent>
                    </Popover>
                  )}
                </>
              );
            }}
          />
        </div>
      </div>
    </div>
  );
}
