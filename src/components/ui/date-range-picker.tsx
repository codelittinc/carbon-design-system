"use client";

import { cn } from "@/lib/cn";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export interface MonthYearRange {
  startMonth: number;
  startYear: number;
  endMonth: number;
  endYear: number;
}

interface DateRangePickerProps {
  value: MonthYearRange;
  onChange: (value: MonthYearRange) => void;
  /** Selectable years, e.g. [2023, 2024, 2025]. */
  years: number[];
  className?: string;
}

const selectClass =
  "h-7 rounded border border-border bg-surface-raised px-1.5 text-xs text-text-primary";

/**
 * Month/year range selector: a start month+year, the word "to", and an end
 * month+year. Controlled via a MonthYearRange value, used for report periods.
 */
export function DateRangePicker({ value, onChange, years, className }: DateRangePickerProps) {
  return (
    <div className={cn("flex items-center gap-1.5 text-xs", className)}>
      <div className="flex items-center gap-1">
        <select
          value={value.startMonth}
          onChange={(e) => onChange({ ...value, startMonth: Number(e.target.value) })}
          className={selectClass}
        >
          {MONTH_NAMES.map((m, i) => (
            <option key={i} value={i + 1}>
              {m}
            </option>
          ))}
        </select>
        <select
          value={value.startYear}
          onChange={(e) => onChange({ ...value, startYear: Number(e.target.value) })}
          className={selectClass}
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
      <span className="text-text-muted">to</span>
      <div className="flex items-center gap-1">
        <select
          value={value.endMonth}
          onChange={(e) => onChange({ ...value, endMonth: Number(e.target.value) })}
          className={selectClass}
        >
          {MONTH_NAMES.map((m, i) => (
            <option key={i} value={i + 1}>
              {m}
            </option>
          ))}
        </select>
        <select
          value={value.endYear}
          onChange={(e) => onChange({ ...value, endYear: Number(e.target.value) })}
          className={selectClass}
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
