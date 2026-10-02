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
  WEEKDAY_LABELS,
  dateKey,
  formatCalendarDate,
  isWeekend,
  monthWeeks,
  parseDateKey,
  type YearMonth,
} from "@/lib/calendar";
import {
  cellKey,
  contractCoversDay,
  datePart,
  type TimesheetContract,
  type TimesheetGridData,
  type TimesheetTimeOff,
} from "@/lib/timesheet";
import { Badge } from "./badge";
import { Button } from "./button";
import { Card } from "./card";
import { Input } from "./input";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "./table";

/**
 * The hours field, shared with the weekly grid. A number input with its
 * spinner hidden: a quarter-hour step is typed, not clicked.
 */
export const hoursInputClass =
  "h-8 px-1 text-center tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

export function dayLabel(date: string, weekday: "long" | "short" = "short"): string {
  const day = parseDateKey(date);
  return day ? formatCalendarDate(day, { weekday, month: "short", day: "numeric", year: "numeric" }) : date;
}

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
  onCellChange,
}: MonthlyCalendarGridProps): ReactElement {
  const inlineInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedDay && inlineInputRef.current) {
      inlineInputRef.current.focus();
      inlineInputRef.current.select();
    }
  }, [selectedDay]);

  const cells = monthWeeks(month).flat();

  const dayTotal = (date: string) =>
    contracts.reduce((sum, c) => sum + (gridData[cellKey(c.id, date)] || 0), 0);

  return (
    <div>
      <div className="mb-px grid grid-cols-7 gap-px">
        {WEEKDAY_LABELS.map((label, i) => (
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
        {cells.map((cell, idx) => {
          if (!cell) return <div key={`empty-${idx}`} className="min-h-[72px] bg-bg" />;

          const date = dateKey(cell);
          const weekend = isWeekend(cell);
          const isToday = date === today;
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
              <TableRow className="border-0">
                <TableCell colSpan={2} className="py-6 text-center text-text-muted">
                  No active contracts for this day.
                </TableCell>
              </TableRow>
            )}
            {contracts.map((contract, idx) => (
              <TableRow
                key={contract.id}
                className="hover:bg-table-row-hover"
              >
                <TableCell>
                  <ContractName contract={contract} />
                </TableCell>
                <TableCell>
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
