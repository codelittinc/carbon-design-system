"use client";

/**
 * The parts every calendar in the package draws the same way: the
 * previous / next / today header, and the bordered month of big day cells.
 * Internal: `MonthCalendar`, `EventCalendar` and `TimesheetTable` compose
 * these; the package does not export them.
 */

import type { ReactElement, ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  WEEKDAY_LABELS,
  dateKey,
  formatCalendarDate,
  isWeekend,
  monthWeeks,
  type CalendarDate,
  type YearMonth,
} from "@/lib/calendar";
import { eyebrowClass } from "@/lib/ui-classes";
import { Button } from "./button";

interface PeriodNavProps {
  /** The period shown: "September 2026", "Sep 14 – Sep 20, 2026". */
  label: string;
  /**
   * `bar` (default): the label as a heading on the left, Today and the arrows
   * on the right — over a calendar or a timesheet. `compact`: the arrows either
   * side of the label, for a picker too narrow for a bar.
   */
  layout?: "bar" | "compact";
  onPrevious: () => void;
  onNext: () => void;
  /** Shows a Today button (bar layout only). */
  onToday?: () => void;
  /** Names of the arrows: "Previous month", "Next week". */
  previousLabel: string;
  nextLabel: string;
  previousDisabled?: boolean;
  nextDisabled?: boolean;
  /** Typically: already showing today's period. */
  todayDisabled?: boolean;
  /** Disables every control, e.g. while loading. */
  disabled?: boolean;
  className?: string;
}

/**
 * Previous / next (and Today) for a calendar period. Every button is
 * `type="button"`: a calendar inside a form must never submit it.
 */
export function PeriodNav({
  label,
  layout = "bar",
  onPrevious,
  onNext,
  onToday,
  previousLabel,
  nextLabel,
  previousDisabled = false,
  nextDisabled = false,
  todayDisabled = false,
  disabled = false,
  className,
}: PeriodNavProps): ReactElement {
  const compact = layout === "compact";
  const arrow = (direction: "previous" | "next"): ReactElement => {
    const previous = direction === "previous";
    const Icon = previous ? ChevronLeft : ChevronRight;
    return (
      <Button
        type="button"
        variant={compact ? "ghost" : "outline"}
        size="icon"
        aria-label={previous ? previousLabel : nextLabel}
        disabled={disabled || (previous ? previousDisabled : nextDisabled)}
        onClick={previous ? onPrevious : onNext}
      >
        <Icon size={16} aria-hidden="true" />
      </Button>
    );
  };

  if (compact) {
    return (
      <div className={cn("flex items-center justify-between", className)}>
        {arrow("previous")}
        <span className="text-sm font-medium text-text-primary" aria-live="polite">
          {label}
        </span>
        {arrow("next")}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-2", className)}>
      <h2 className="text-lg font-semibold text-text-primary" aria-live="polite">
        {label}
      </h2>
      <div className="flex items-center gap-2">
        {onToday && (
          <Button type="button" variant="outline" disabled={disabled || todayDisabled} onClick={onToday}>
            Today
          </Button>
        )}
        {arrow("previous")}
        {arrow("next")}
      </div>
    </div>
  );
}

export interface MonthGridDay {
  /** `"2026-09-14"`. */
  key: string;
  isToday: boolean;
  isWeekend: boolean;
}

interface MonthGridProps {
  month: YearMonth;
  /** Names the table: "Calendar, September 2026". */
  ariaLabel: string;
  /** Today's key, in the reader's zone (`dateKey(todayIn())`). */
  today: string;
  /** What a day's cell holds. The cell itself is drawn here. */
  renderDay: (date: CalendarDate, day: MonthGridDay) => ReactNode;
  /** Classes for a day's cell: its height, its background. */
  dayClassName?: (date: CalendarDate, day: MonthGridDay) => string | undefined;
  /**
   * Draws the Sat / Sun headers in the faint text, for a grid whose weekends
   * are dimmed throughout (the timesheet). Off by default: every header is the
   * muted text, which clears AA; the faint text does not.
   */
  dimWeekendHeaders?: boolean;
  className?: string;
}

/**
 * A month as a bordered grid of big day cells, Monday first, with the days
 * outside the month left blank.
 *
 * A table, not a grid: the days hold buttons and fields reached with Tab, and
 * there is no arrow-key movement between them, which `role="grid"` would
 * promise. CSS grid lays it out, so the table semantics are roles: table > row
 * > columnheader / cell. Each day's cell is named by its full date.
 */
export function MonthGrid({
  month,
  ariaLabel,
  today,
  renderDay,
  dayClassName,
  dimWeekendHeaders = false,
  className,
}: MonthGridProps): ReactElement {
  return (
    <div role="table" aria-label={ariaLabel} className={className}>
      <div role="row" className="grid grid-cols-7">
        {WEEKDAY_LABELS.map((label, i) => (
          <div
            key={label}
            role="columnheader"
            className={cn(eyebrowClass, "py-2 text-center", dimWeekendHeaders && i >= 5 && "text-text-faint")}
          >
            {label}
          </div>
        ))}
      </div>

      <div role="rowgroup" className="divide-y divide-border overflow-hidden rounded-lg border border-border">
        {monthWeeks(month).map((week, w) => (
          <div key={w} role="row" className="grid grid-cols-7 divide-x divide-border">
            {week.map((date, d) => {
              if (!date) return <div key={`blank-${d}`} role="cell" className="bg-bg" />;
              const key = dateKey(date);
              const day: MonthGridDay = { key, isToday: key === today, isWeekend: isWeekend(date) };
              return (
                <div
                  key={key}
                  role="cell"
                  aria-label={formatCalendarDate(date, { weekday: "long", month: "long", day: "numeric" })}
                  aria-current={day.isToday ? "date" : undefined}
                  className={cn("min-w-0", dayClassName?.(date, day))}
                >
                  {renderDay(date, day)}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
