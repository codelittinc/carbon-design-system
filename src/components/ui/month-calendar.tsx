"use client";

import type { ReactElement } from "react";
import { cn } from "@/lib/cn";
import { eyebrowClass } from "@/lib/ui-classes";
import { Button } from "./button";
import { PeriodNav } from "./calendar-chrome";
import {
  WEEKDAY_LABELS,
  compareMonths,
  dateKey,
  monthLabel,
  monthWeeks,
  shiftMonth,
  type YearMonth,
} from "@/lib/calendar";

export interface MonthCalendarProps {
  /** The month on screen. Controlled, like the selection. */
  month: YearMonth;
  onMonthChange: (next: YearMonth) => void;
  /** The chosen day as `"2026-09-03"`, or null before anything is picked. */
  selected: string | null;
  onSelect: (key: string) => void;
  /**
   * The days that may be chosen. Everything else renders disabled rather than
   * absent, so the month keeps its shape.
   *
   * Omit it and every day in the month is pickable, which is what an ordinary
   * date field wants. Pass a set when the days on offer are the point —
   * somebody's published hours, the nights a room is free.
   */
  available?: Set<string>;
  /**
   * Why a day outside `available` is closed, read after the date by a screen
   * reader ("3 September 2026, no times"). The default only says that it is;
   * a picker that closes days for a reason — nobody is free, it has not happened
   * yet — should say which, or the cell announces something vaguer than the
   * screen shows.
   */
  unavailableLabel?: string;
  /** The furthest back and forward the arrows go. */
  min: YearMonth;
  max: YearMonth;
  className?: string;
  /** Names the grid for a screen reader; it is a group, not one control. */
  "aria-label"?: string;
}

/**
 * A month grid for picking one day.
 *
 * The day-level counterpart to `DateRangePicker`, which selects a range of
 * MONTHS and is a different control. Controlled in both dimensions — the month
 * on screen and the day chosen — because the two move independently: paging to
 * December does not unpick the 3rd of September.
 *
 * Every cell is a `Button`, so keyboard and focus behaviour come from the same
 * place as everything else rather than being reimplemented on a `<div>`.
 *
 * **Every one of those buttons carries `type="button"`, and it is load-bearing.**
 * `Button` renders a bare `<button>` and sets no default type, matching HTML —
 * so inside a `<form>` an unmarked one is implicitly `type="submit"`. Without
 * this, picking a day submits the form the calendar sits in, and so does pressing
 * the month arrow. That shipped in a consuming app: on a dialog whose submit
 * marked somebody for removal, paging to the next month did it.
 */
export function MonthCalendar({
  month,
  onMonthChange,
  selected,
  onSelect,
  available,
  unavailableLabel = "unavailable",
  min,
  max,
  className,
  "aria-label": ariaLabel = "Choose a day",
}: MonthCalendarProps): ReactElement {
  const cells = monthWeeks(month).flat();

  const canGoBack = compareMonths(month, min) > 0;
  const canGoForward = compareMonths(month, max) < 0;

  return (
    <div role="group" aria-label={ariaLabel} className={cn("w-[17.5rem] shrink-0", className)}>
      <PeriodNav
        layout="compact"
        className="mb-2"
        label={monthLabel(month)}
        onPrevious={() => onMonthChange(shiftMonth(month, -1))}
        onNext={() => onMonthChange(shiftMonth(month, 1))}
        previousLabel="Previous month"
        nextLabel="Next month"
        previousDisabled={!canGoBack}
        nextDisabled={!canGoForward}
      />

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAY_LABELS.map((label) => (
          <span
            key={label}
            aria-hidden="true"
            className={cn(eyebrowClass, "pb-1 text-center text-[10px] tracking-normal text-text-faint")}
          >
            {label[0]}
          </span>
        ))}

        {cells.map((cell, i) => {
          if (!cell) return <span key={`blank-${i}`} aria-hidden="true" />;
          const { day } = cell;
          const key = dateKey(cell);
          const open = available ? available.has(key) : true;
          const isSelected = key === selected;

          return (
            <Button
              key={key}
              type="button"
              variant={isSelected ? "default" : open ? "outline" : "ghost"}
              size="icon"
              className="h-9 w-9"
              disabled={!open}
              aria-label={`${day} ${monthLabel(month)}${open ? "" : `, ${unavailableLabel}`}`}
              aria-pressed={isSelected}
              onClick={() => onSelect(key)}
            >
              {day}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
