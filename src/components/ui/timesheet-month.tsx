"use client";

/**
 * The monthly view of `TimesheetTable`: a calendar of day totals, and the panel
 * that edits one day across several contracts. Internal to the package — only
 * `TimesheetTable` renders these.
 */

import { useEffect, useRef, type ReactElement } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  cellKey,
  contractCoversDay,
  datePart,
  getDaysInMonth,
  type TimesheetContract,
  type TimesheetGridData,
  type TimesheetTimeOff,
} from "@/lib/timesheet";
import { Badge } from "./badge";
import { Button } from "./button";
import { Card } from "./card";
import { Input } from "./input";

const DAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/**
 * The hours field, shared with the weekly grid. A number input with its
 * spinner hidden: a quarter-hour step is typed, not clicked.
 */
export const hoursInputClass =
  "h-8 px-1 text-center tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

export function dayLabel(date: string, weekday: "long" | "short" = "short"): string {
  return new Date(date + "T00:00:00.000Z").toLocaleDateString("en-US", {
    weekday,
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function isTimeOffDay(date: string, timeOffs: TimesheetTimeOff[]): boolean {
  // endsAt is the return date, so it is exclusive.
  return timeOffs.some((to) => date >= datePart(to.startsAt) && date < datePart(to.endsAt));
}

interface MonthlyCalendarGridProps {
  monthDate: Date;
  gridData: TimesheetGridData;
  contracts: TimesheetContract[];
  timeOffs: TimesheetTimeOff[];
  today: string;
  selectedDay: string | null;
  onDaySelect: (date: string) => void;
  onCellChange: (contractId: number, date: string, value: string) => void;
}

/**
 * A month of day totals. Selecting a day with one contract edits it in place;
 * a day with several opens `DayDetailPanel` below. A past weekday with no hours
 * and no time off is flagged.
 */
export function MonthlyCalendarGrid({
  monthDate,
  gridData,
  contracts,
  timeOffs,
  today,
  selectedDay,
  onDaySelect,
  onCellChange,
}: MonthlyCalendarGridProps): ReactElement {
  const year = monthDate.getUTCFullYear();
  const month = monthDate.getUTCMonth();
  const inlineInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedDay && inlineInputRef.current) {
      inlineInputRef.current.focus();
      inlineInputRef.current.select();
    }
  }, [selectedDay]);

  // Monday-first: Sunday's 0 becomes the last column.
  const startDow = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
  const cells: (string | null)[] = Array(startDow).fill(null);
  for (let d = 1; d <= getDaysInMonth(monthDate); d++) {
    cells.push(`${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const dayTotal = (date: string) =>
    contracts.reduce((sum, c) => sum + (gridData[cellKey(c.id, date)] || 0), 0);

  return (
    <div>
      <div className="mb-px grid grid-cols-7 gap-px">
        {DAY_HEADERS.map((label, i) => (
          <div
            key={label}
            className={cn(
              "py-2 text-center text-xs font-medium uppercase tracking-wider",
              i >= 5 ? "text-text-faint" : "text-text-muted",
            )}
          >
            {label}
          </div>
        ))}
      </div>

      {/* The 1px gap over a border-colored ground draws the grid lines. */}
      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-border bg-border">
        {cells.map((date, idx) => {
          if (!date) return <div key={`empty-${idx}`} className="min-h-[72px] bg-bg" />;

          const dow = new Date(date + "T00:00:00.000Z").getUTCDay();
          const isWeekend = dow === 0 || dow === 6;
          const isToday = date === today;
          const isSelected = date === selectedDay;
          const total = dayTotal(date);
          const hasTimeOff = isTimeOffDay(date, timeOffs);
          const isMissingHours = !isWeekend && date < today && total === 0 && !hasTimeOff;
          const dayContracts = contracts.filter((c) => contractCoversDay(c, date));

          const background = isMissingHours
            ? "bg-error-soft"
            : isToday
              ? "bg-accent-muted"
              : isWeekend
                ? "bg-surface-raised"
                : "bg-surface";

          const header = (
            <div className="flex items-start justify-between">
              <span
                className={cn(
                  "text-sm font-medium tabular-nums",
                  isToday ? "text-accent-text" : isWeekend ? "text-text-faint" : "text-text-primary",
                )}
              >
                {parseInt(date.split("-")[2])}
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
              <div
                key={date}
                className={cn("min-h-[72px] p-2 ring-2 ring-inset ring-accent", background)}
              >
                {header}
                <Input
                  ref={inlineInputRef}
                  type="number"
                  step="0.25"
                  min="0"
                  max="24"
                  aria-label={`Hours for ${contract.projectName} on ${dayLabel(date)}`}
                  value={gridData[cellKey(contract.id, date)] ?? ""}
                  onChange={(e) => onCellChange(contract.id, date, e.target.value)}
                  onFocus={(e) => e.target.select()}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") onDaySelect(date);
                  }}
                  placeholder={"–"}
                  className={cn(hoursInputClass, "mt-1 h-7")}
                />
              </div>
            );
          }

          return (
            <Button
              key={date}
              type="button"
              variant="ghost"
              aria-pressed={isSelected}
              aria-label={`${dayLabel(date)}${total > 0 ? `, ${total} hours` : ""}${hasTimeOff ? ", time off" : ""}${isMissingHours ? ", no hours" : ""}`}
              onClick={() => onDaySelect(date)}
              className={cn(
                // A whole calendar cell, not an inline button: stacked, square, full height.
                "flex h-auto min-h-[72px] w-full flex-col items-stretch justify-start gap-0 whitespace-normal rounded-none p-2 text-left font-normal focus-visible:ring-inset",
                background,
                "hover:bg-surface-overlay",
                isSelected && "ring-2 ring-inset ring-accent",
              )}
            >
              {header}
              {total > 0 && (
                <div className="mt-1 text-xs font-semibold tabular-nums text-text-primary">
                  {total}h
                </div>
              )}
              {isMissingHours && <div className="mt-1 text-[10px] text-error-text">No hours</div>}
            </Button>
          );
        })}
      </div>
    </div>
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
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                Contract
              </th>
              <th className="w-[100px] px-3 py-2 text-center text-xs font-medium uppercase tracking-wider text-text-muted">
                Hours
              </th>
            </tr>
          </thead>
          <tbody>
            {contracts.length === 0 && (
              <tr>
                <td colSpan={2} className="py-6 text-center text-text-muted">
                  No active contracts for this day.
                </td>
              </tr>
            )}
            {contracts.map((contract, idx) => (
              <tr
                key={contract.id}
                className="border-b border-border-subtle hover:bg-table-row-hover"
              >
                <td className="px-3 py-2">
                  <ContractName contract={contract} />
                </td>
                <td className="px-3 py-2">
                  <Input
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="number"
                    step="0.25"
                    min="0"
                    max="24"
                    aria-label={`Hours for ${contract.projectName} on ${dayLabel(selectedDay)}`}
                    value={gridData[cellKey(contract.id, selectedDay)] ?? ""}
                    disabled={!contractCoversDay(contract, selectedDay)}
                    onChange={(e) => onCellChange(contract.id, selectedDay, e.target.value)}
                    onFocus={(e) => e.target.select()}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    placeholder={contractCoversDay(contract, selectedDay) ? "–" : ""}
                    className={hoursInputClass}
                  />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-border">
              <td className="px-3 py-2 text-xs font-medium uppercase text-text-muted">Total</td>
              <td
                className={cn(
                  "px-3 py-2 text-center font-semibold tabular-nums",
                  total > 0 ? "text-text-primary" : "text-text-faint",
                )}
              >
                {total > 0 ? `${total}h` : "–"}
              </td>
            </tr>
          </tfoot>
        </table>
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
