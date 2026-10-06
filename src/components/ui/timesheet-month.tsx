"use client";

/**
 * The monthly view of `TimesheetTable`: a calendar of day totals, and the panel
 * that edits one day across several contracts. Internal to the package — only
 * `TimesheetTable` renders these.
 */

import { forwardRef, useEffect, useRef, useState, type ReactElement } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { datePart, formatDateKey, monthLabel, type YearMonth } from "@/lib/calendar";
import { tableRowHoverClass } from "@/lib/ui-classes";
import {
  cellKey,
  contractCoversDay,
  type TimesheetContract,
  type TimesheetGridData,
  type TimesheetTimeOff,
} from "@/lib/timesheet";
import { Badge } from "./badge";
import { Button } from "./button";
import { MonthGrid } from "./calendar-chrome";
import { Card } from "./card";
import { Input } from "./input";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "./table";
import { TableEmptyRow } from "./table-empty-row";

/** "Mon, Sep 14, 2026" (or "Monday, …") from a "2026-09-14" key. */
export function dayLabel(date: string, weekday: "long" | "short" = "short"): string {
  return formatDateKey(date, { weekday, month: "short", day: "numeric", year: "numeric" });
}

/** Up to 24 with two decimals, or a step on the way there ("", "7", "7."). */
const HOURS_DRAFT = /^\d{0,2}(\.\d{0,2})?$/;

type HoursInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> & {
  value: number | null | undefined;
  /** The text typed, once it reads as hours; `TimesheetTable` parses it. */
  onValueChange: (value: string) => void;
};

/**
 * The hours field, in the weekly grid, the month calendar and the day panel.
 * A text input with a decimal keypad (as `MoneyInput`), not `type="number"`:
 * a number input has no caret position, so the grid's Left/Right arrows could
 * never tell when the caret is at the edge. While focused it keeps the text as
 * typed, so "7." survives on the way to "7.5"; anything that cannot become
 * 0–24 hours is not taken.
 */
export const HoursInput = forwardRef<HTMLInputElement, HoursInputProps>(
  ({ value, onValueChange, onFocus, onBlur, className, ...props }, ref): ReactElement => {
    const [draft, setDraft] = useState<string | null>(null);
    // The draft shows only while it still reads as the value, so a value
    // changed from outside (a revert, a refetch) is never hidden behind it.
    const draftHours = draft === null ? undefined : draft === "" || draft === "." ? null : parseFloat(draft);
    const shown = draft !== null && draftHours === (value ?? null) ? draft : value == null ? "" : String(value);
    return (
      <Input
        ref={ref}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={shown}
        onChange={(e) => {
          const next = e.target.value.trim();
          if (!HOURS_DRAFT.test(next) || parseFloat(next) > 24) return;
          setDraft(next);
          onValueChange(next === "." ? "" : next);
        }}
        onFocus={(e) => {
          setDraft(value == null ? "" : String(value));
          e.target.select();
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setDraft(null);
          onBlur?.(e);
        }}
        className={cn("h-8 px-1 text-center tabular-nums", className)}
        {...props}
      />
    );
  },
);
HoursInput.displayName = "HoursInput";

function isTimeOffDay(date: string, timeOffs: TimesheetTimeOff[]): boolean {
  // endsAt is the return date, so it is exclusive.
  return timeOffs.some((to) => date >= datePart(to.startsAt) && date < datePart(to.endsAt));
}

interface MonthlyCalendarGridProps {
  month: YearMonth;
  gridData: TimesheetGridData;
  contracts: TimesheetContract[];
  timeOffs: TimesheetTimeOff[];
  today: string;
  selectedDay: string | null;
  onDaySelect: (date: string) => void;
  /** Closes the inline editor (Escape), handing focus back to its day. */
  onClose: () => void;
  onCellChange: (contractId: number, date: string, value: string) => void;
}

/**
 * A month of day totals. Selecting a day with one contract edits it in place;
 * a day with several opens `DayDetailPanel` below. A past weekday with no hours
 * and no time off is flagged.
 */
export function MonthlyCalendarGrid({
  month,
  gridData,
  contracts,
  timeOffs,
  today,
  selectedDay,
  onDaySelect,
  onClose,
  onCellChange,
}: MonthlyCalendarGridProps): ReactElement {
  const inlineInputRef = useRef<HTMLInputElement>(null);
  const dayButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  // The day whose inline editor Escape just closed, to focus its button again.
  const returnFocusTo = useRef<string | null>(null);

  useEffect(() => {
    if (selectedDay && inlineInputRef.current) {
      inlineInputRef.current.focus();
      inlineInputRef.current.select();
    } else if (!selectedDay && returnFocusTo.current) {
      dayButtonRefs.current[returnFocusTo.current]?.focus();
    }
    returnFocusTo.current = null;
  }, [selectedDay]);

  const dayTotal = (date: string) =>
    contracts.reduce((sum, c) => sum + (gridData[cellKey(c.id, date)] || 0), 0);

  return (
    <MonthGrid
      month={month}
      ariaLabel={`Hours, ${monthLabel(month)}`}
      today={today}
      // The weekend days are dimmed below, so their headers are too.
      dimWeekendHeaders
      dayClassName={() => "flex min-h-[72px]"}
      renderDay={(cell, { key: date, isToday, isWeekend: weekend }) => {
        const isSelected = date === selectedDay;
        const total = dayTotal(date);
        const hasTimeOff = isTimeOffDay(date, timeOffs);
        const isMissingHours = !weekend && date < today && total === 0 && !hasTimeOff;
        const dayContracts = contracts.filter((c) => contractCoversDay(c, date));

        const background = isMissingHours
          ? "bg-error-soft"
          : isToday
            ? "bg-accent-muted"
            : weekend
              ? "bg-surface-raised"
              : "bg-surface";

        const header = (
          <div className="flex items-start justify-between">
            <span
              className={cn(
                "text-sm font-medium tabular-nums",
                isToday ? "text-accent-text" : weekend ? "text-text-faint" : "text-text-primary",
              )}
            >
              {cell.day}
            </span>
            {hasTimeOff && (
              <Badge variant="info" className="px-1 text-[10px]">
                PTO
              </Badge>
            )}
          </div>
        );

        if (isSelected && dayContracts.length === 1) {
          const contract = dayContracts[0];
          return (
            <div className={cn("w-full p-2 ring-2 ring-inset ring-accent", background)}>
              {header}
              <HoursInput
                ref={inlineInputRef}
                aria-label={`Hours for ${contract.projectName} on ${dayLabel(date)}`}
                value={gridData[cellKey(contract.id, date)]}
                onValueChange={(value) => onCellChange(contract.id, date, value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    e.preventDefault();
                    returnFocusTo.current = date;
                    onClose();
                  }
                }}
                placeholder={"–"}
                className="mt-1 h-7"
              />
            </div>
          );
        }

        return (
          <Button
            ref={(el) => {
              dayButtonRefs.current[date] = el;
            }}
            type="button"
            variant="ghost"
            aria-pressed={isSelected}
            aria-label={`${dayLabel(date)}${total > 0 ? `, ${total} hours` : ""}${hasTimeOff ? ", time off" : ""}${isMissingHours ? ", no hours" : ""}`}
            onClick={() => onDaySelect(date)}
            className={cn(
              // A whole calendar cell, not an inline button: stacked, square, full height.
              "flex h-auto w-full flex-col items-stretch justify-start gap-0 whitespace-normal rounded-none p-2 text-left font-normal focus-visible:ring-inset",
              background,
              "hover:bg-surface-overlay",
              isSelected && "ring-2 ring-inset ring-accent",
            )}
          >
            {header}
            {total > 0 && (
              <div className="mt-1 text-xs font-semibold tabular-nums text-text-primary">{total}h</div>
            )}
            {isMissingHours && <div className="mt-1 text-[10px] text-error-text">No hours</div>}
          </Button>
        );
      }}
    />
  );
}

interface DayDetailPanelProps {
  selectedDay: string;
  contracts: TimesheetContract[];
  gridData: TimesheetGridData;
  onCellChange: (contractId: number, date: string, value: string) => void;
  onClose: () => void;
}

/** Hours for one day, one row per contract — for days with several contracts. */
export function DayDetailPanel({
  selectedDay,
  contracts,
  gridData,
  onCellChange,
  onClose,
}: DayDetailPanelProps): ReactElement {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, contracts.length);
  }, [contracts.length]);

  useEffect(() => {
    panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedDay]);

  const focusRow = (idx: number) => {
    inputRefs.current[idx]?.focus();
    inputRefs.current[idx]?.select();
  };

  // Up/Down, Enter and Tab walk the rows; at either end Tab leaves the panel.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === "ArrowUp" || (e.key === "Tab" && e.shiftKey)) {
      if (idx > 0) {
        e.preventDefault();
        focusRow(idx - 1);
      }
    } else if (e.key === "ArrowDown" || e.key === "Enter" || (e.key === "Tab" && !e.shiftKey)) {
      if (idx < contracts.length - 1) {
        e.preventDefault();
        focusRow(idx + 1);
      }
    }
  };

  const total = contracts.reduce((sum, c) => sum + (gridData[cellKey(c.id, selectedDay)] || 0), 0);

  return (
    <div ref={panelRef}>
      <Card padding="sm">
        <div className="flex items-center justify-between px-3 pb-3 pt-2">
          <h3 className="text-sm font-semibold text-text-primary">
            {dayLabel(selectedDay, "long")}
          </h3>
          <Button type="button" variant="ghost" size="icon" aria-label="Close" onClick={onClose}>
            <X size={14} />
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                Contract
              </TableHead>
              <TableHead className="w-[100px] text-center">
                Hours
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contracts.length === 0 && (
              <TableEmptyRow colSpan={2}>No active contracts for this day.</TableEmptyRow>
            )}
            {contracts.map((contract, idx) => (
              <TableRow key={contract.id} className={tableRowHoverClass}>
                <TableCell>
                  <ContractName contract={contract} />
                </TableCell>
                <TableCell>
                  <HoursInput
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    aria-label={`Hours for ${contract.projectName} on ${dayLabel(selectedDay)}`}
                    value={gridData[cellKey(contract.id, selectedDay)]}
                    disabled={!contractCoversDay(contract, selectedDay)}
                    onValueChange={(value) => onCellChange(contract.id, selectedDay, value)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    placeholder={contractCoversDay(contract, selectedDay) ? "–" : ""}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell className="text-xs font-medium uppercase text-text-muted">Total</TableCell>
              <TableCell
                className={cn(
                  "text-center font-semibold tabular-nums",
                  total > 0 ? "text-text-primary" : "text-text-faint",
                )}
              >
                {total > 0 ? `${total}h` : "–"}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </Card>
    </div>
  );
}

/** The project, then "customer · contract" under it. */
export function ContractName({ contract }: { contract: TimesheetContract }): ReactElement {
  return (
    <>
      <div className="truncate text-sm font-medium text-text-primary">{contract.projectName}</div>
      <div className="truncate text-xs text-text-muted">
        {contract.customerName} &middot; {contract.name}
      </div>
    </>
  );
}
