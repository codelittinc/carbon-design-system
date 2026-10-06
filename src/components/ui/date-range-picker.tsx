"use client";

import type { ReactElement } from "react";
import { cn } from "@/lib/cn";
import { shortMonthName } from "@/lib/format";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

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

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: shortMonthName(i + 1) }));

/** Compact trigger sizing; fixed widths so the row doesn't shift as the value changes. */
const triggerClass = "h-7 gap-1 px-2 text-xs";

function NumberSelect({
  value,
  onChange,
  options,
  label,
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  options: { value: number; label: string }[];
  label: string;
  className: string;
}) {
  return (
    <Select value={String(value)} onValueChange={(v) => onChange(Number(v))}>
      <SelectTrigger aria-label={label} className={cn(triggerClass, className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={String(o.value)}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/**
 * Month/year range selector: a start month+year, the word "to", and an end
 * month+year. Controlled via a MonthYearRange value, used for report periods.
 */
export function DateRangePicker({ value, onChange, years, className }: DateRangePickerProps): ReactElement {
  // A Radix Select shows nothing for a value with no matching item, so a saved
  // period from outside `years` would render as a blank trigger. Always offer
  // the selected years.
  const yearOptions = [...new Set([...years, value.startYear, value.endYear])]
    .sort((a, b) => a - b)
    .map((y) => ({ value: y, label: String(y) }));
  return (
    <div className={cn("flex items-center gap-1.5 text-xs", className)}>
      <div className="flex items-center gap-1">
        <NumberSelect
          label="Start month"
          value={value.startMonth}
          onChange={(startMonth) => onChange({ ...value, startMonth })}
          options={MONTH_OPTIONS}
          className="w-16"
        />
        <NumberSelect
          label="Start year"
          value={value.startYear}
          onChange={(startYear) => onChange({ ...value, startYear })}
          options={yearOptions}
          className="w-[4.5rem]"
        />
      </div>
      <span className="text-text-muted">to</span>
      <div className="flex items-center gap-1">
        <NumberSelect
          label="End month"
          value={value.endMonth}
          onChange={(endMonth) => onChange({ ...value, endMonth })}
          options={MONTH_OPTIONS}
          className="w-16"
        />
        <NumberSelect
          label="End year"
          value={value.endYear}
          onChange={(endYear) => onChange({ ...value, endYear })}
          options={yearOptions}
          className="w-[4.5rem]"
        />
      </div>
    </div>
  );
}
