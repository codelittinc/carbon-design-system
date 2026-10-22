"use client";

import type { ReactElement } from "react";
import { Button } from "./button";
import { CompactMonth } from "./calendar-chrome";
import { monthLabel, type YearMonth } from "@/lib/calendar";

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
  return (
    <CompactMonth
      month={month}
      onMonthChange={onMonthChange}
      min={min}
      max={max}
      ariaLabel={ariaLabel}
      className={className}
      renderDay={(cell, key) => {
        const open = available ? available.has(key) : true;
        const isSelected = key === selected;
        return (
          <Button
            type="button"
            variant={isSelected ? "default" : open ? "outline" : "ghost"}
            size="icon"
            className="h-9 w-9"
            disabled={!open}
            aria-label={`${cell.day} ${monthLabel(month)}${open ? "" : `, ${unavailableLabel}`}`}
            aria-pressed={isSelected}
            onClick={() => onSelect(key)}
          >
            {cell.day}
          </Button>
        );
      }}
    />
  );
}
