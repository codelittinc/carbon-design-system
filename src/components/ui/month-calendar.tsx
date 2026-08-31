"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import {
  compareMonths,
  dateKey,
  daysInMonth,
  monthLabel,
  shiftMonth,
  weekdayOf,
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
  /** The furthest back and forward the arrows go. */
  min: YearMonth;
  max: YearMonth;
  className?: string;
  /** Names the grid for a screen reader; it is a group, not one control. */
  "aria-label"?: string;
}

/** Monday-first, matching `weekdayOf`. */
const WEEKDAY_INITIALS = ["M", "T", "W", "T", "F", "S", "S"];

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
  min,
  max,
  className,
  "aria-label": ariaLabel = "Choose a day",
}: MonthCalendarProps) {
  const total = daysInMonth(month.year, month.month);
  const leadingBlanks = weekdayOf({ ...month, day: 1 });

  const canGoBack = compareMonths(month, min) > 0;
  const canGoForward = compareMonths(month, max) < 0;

  return (
    <div role="group" aria-label={ariaLabel} className={cn("w-[17.5rem] shrink-0", className)}>
      <div className="mb-2 flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Previous month"
          disabled={!canGoBack}
          onClick={() => onMonthChange(shiftMonth(month, -1))}
        >
          <ChevronLeft size={16} />
        </Button>
        <span className="text-sm font-medium text-text-primary">{monthLabel(month)}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Next month"
          disabled={!canGoForward}
          onClick={() => onMonthChange(shiftMonth(month, 1))}
        >
          <ChevronRight size={16} />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAY_INITIALS.map((day, index) => (
          <span
            key={`${day}-${index}`}
            aria-hidden="true"
            className="pb-1 text-center text-[10px] font-medium uppercase text-text-faint"
          >
            {day}
          </span>
        ))}

        {Array.from({ length: leadingBlanks }, (_, i) => (
          <span key={`blank-${i}`} aria-hidden="true" />
        ))}

        {Array.from({ length: total }, (_, i) => {
          const day = i + 1;
          const key = dateKey({ ...month, day });
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
              aria-label={`${day} ${monthLabel(month)}${open ? "" : ", unavailable"}`}
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
