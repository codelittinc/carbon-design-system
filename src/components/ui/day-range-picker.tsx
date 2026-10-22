"use client";

import { useState, type ReactElement } from "react";
import { cn } from "@/lib/cn";
import { eyebrowClass } from "@/lib/ui-classes";
import { Button } from "./button";
import { PeriodNav } from "./calendar-chrome";
import {
  WEEKDAY_LABELS,
  compareMonths,
  dateKey,
  isWeekend,
  monthLabel,
  monthWeeks,
  shiftMonth,
  type YearMonth,
} from "@/lib/calendar";

/** A range of days as ISO keys. `end` is null while only the first day is picked. */
export interface DayRange {
  start: string | null;
  end: string | null;
}

/**
 * The range after somebody clicks `key`.
 *
 * - Nothing picked, or a whole range already picked: `key` starts a new one.
 * - Only the first day picked: a later day (or the same one) ends the range; an
 *   earlier day starts it over from there, rather than silently swapping the
 *   ends — the person clicked the day they want to start on.
 *
 * ISO keys compare as dates, so string order is calendar order.
 */
export function nextDayRange(value: DayRange, key: string): DayRange {
  if (!value.start || value.end) return { start: key, end: null };
  if (key < value.start) return { start: key, end: null };
  return { start: value.start, end: key };
}

export interface DayRangePickerProps {
  /** The month on screen. Controlled, like the range. */
  month: YearMonth;
  onMonthChange: (next: YearMonth) => void;
  value: DayRange;
  onChange: (next: DayRange) => void;
  /** The furthest back and forward the arrows go. */
  min: YearMonth;
  max: YearMonth;
  /**
   * The first and last days that may be picked, as ISO keys. Days outside render
   * disabled rather than absent, so the month keeps its shape — past days on a
   * request form, days before somebody can book.
   */
  firstDay?: string;
  lastDay?: string;
  /** Why a day outside `firstDay`/`lastDay` is closed, for a screen reader. */
  unavailableLabel?: string;
  /**
   * Days drawn faint, with the reason read after the date and shown on hover:
   * `{ "2026-11-26": "Thanksgiving" }`. They can still sit inside a range, and
   * still be clicked — a request can run over a holiday — but the reader sees at
   * a glance which days the range does not really cover.
   */
  muted?: Record<string, string>;
  /** Draws Saturdays and Sundays faint too, labelled "weekend". */
  muteWeekends?: boolean;
  className?: string;
  /** Names the grid for a screen reader; it is a group, not one control. */
  "aria-label"?: string;
}

/**
 * A month grid for picking a range of DAYS: click the first day, then the last.
 *
 * Not `DateRangePicker`, which selects a range of MONTHS for a report period.
 * This is `MonthCalendar` for a range: the same compact grid, Monday first, the
 * same `PeriodNav`, and every cell a `Button` with `type="button"` — inside a
 * form an unmarked button submits it, and paging a month must never do that.
 *
 * Controlled in both dimensions. Paging to the next month keeps the first day
 * picked, so a range can cross a month: pick the 28th, page, pick the 3rd. While
 * only the first day is picked, hovering a later day previews the range.
 *
 * Muted days (`muted`, `muteWeekends`) are for a range whose cost skips some of
 * its days — time off, where weekends and holidays are free. They stay
 * pickable; what they cost is the consumer's business.
 */
export function DayRangePicker({
  month,
  onMonthChange,
  value,
  onChange,
  min,
  max,
  firstDay,
  lastDay,
  unavailableLabel = "unavailable",
  muted,
  muteWeekends = false,
  className,
  "aria-label": ariaLabel = "Choose the first and last day",
}: DayRangePickerProps): ReactElement {
  const [hovered, setHovered] = useState<string | null>(null);
  const cells = monthWeeks(month).flat();

  // While only the first day is picked, a later hovered day previews the end.
  const previewEnd = value.start && !value.end && hovered && hovered >= value.start ? hovered : null;
  const end = value.end ?? previewEnd;

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
        previousDisabled={compareMonths(month, min) <= 0}
        nextDisabled={compareMonths(month, max) >= 0}
      />

      <div className="grid grid-cols-7 gap-y-1" onMouseLeave={() => setHovered(null)}>
        {WEEKDAY_LABELS.map((label) => (
          <span
            key={label}
            aria-hidden="true"
            className={cn(eyebrowClass, "pb-1 text-center text-[10px] tracking-normal")}
          >
            {label[0]}
          </span>
        ))}

        {cells.map((cell, i) => {
          if (!cell) return <span key={`blank-${i}`} aria-hidden="true" />;
          const key = dateKey(cell);
          const open = (!firstDay || key >= firstDay) && (!lastDay || key <= lastDay);
          const isStart = key === value.start;
          const isEnd = key === value.end;
          // The days from the first to the last (or the previewed last), drawn as one band.
          const inBand = Boolean(value.start && end && key >= value.start && key <= end);
          const inside = inBand && !isStart && !isEnd;
          const reason = muted?.[key] ?? (muteWeekends && isWeekend(cell) ? "weekend" : null);

          const position = isStart && isEnd
            ? ", first and last day"
            : isStart
              ? ", first day"
              : isEnd
                ? ", last day"
                : inside && value.end
                  ? ", in range"
                  : "";

          return (
            <Button
              key={key}
              type="button"
              variant={isStart || isEnd ? "default" : open && !inBand && !reason ? "outline" : "ghost"}
              size="icon"
              className={cn(
                "h-9 w-full",
                inBand ? "rounded-none" : "rounded-md",
                inBand && key === value.start && "rounded-l-md",
                inBand && key === end && "rounded-r-md",
                inside && "bg-accent-muted text-accent-text hover:bg-accent-muted",
                reason && !(isStart || isEnd) && "text-text-faint",
              )}
              disabled={!open}
              title={reason ?? undefined}
              aria-label={`${cell.day} ${monthLabel(month)}${reason ? `, ${reason}` : ""}${position}${open ? "" : `, ${unavailableLabel}`}`}
              aria-pressed={isStart || isEnd}
              onMouseEnter={() => setHovered(key)}
              onFocus={() => setHovered(key)}
              onClick={() => onChange(nextDayRange(value, key))}
            >
              {cell.day}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
