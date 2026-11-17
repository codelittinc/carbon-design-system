/**
 * The data contract behind `TimesheetTable`: what it is given, what it fetches
 * and saves, and the fetch-based API it uses when the caller supplies none.
 *
 * Ported unchanged from the Backstage design system, so an app moving off it
 * keeps its call sites and its server routes. Dates are `YYYY-MM-DD` strings
 * (or ISO instants, of which only the date part is read) and are handled in UTC
 * throughout, so the host's zone never moves a day.
 */

import type { CSSProperties } from "react";
import { datePart } from "./calendar";
import { getCategoricalColor } from "./categorical-colors";

export interface TimesheetContract {
  id: number;
  name: string;
  projectName: string;
  customerName: string;
  /** ISO date. */
  startDate: string;
  /** ISO date. */
  endDate: string;
  /** Contracts on an inactive project are never shown. */
  projectActive: boolean;
}

/** One cell's change, as sent to `saveTimesheet`. `null` hours deletes it. */
export interface TimesheetEntry {
  contractId: number;
  /** YYYY-MM-DD. */
  date: string;
  hours: number | null;
}

export interface TimesheetTimeOff {
  id: number | string;
  type: string;
  startsAt: string;
  /** Exclusive: the day the person is back. */
  endsAt: string;
}

export interface TimeEntryResponse {
  timeEntries: {
    id: number;
    date: string;
    hours: number;
    userId: number;
    contractId: number;
  }[];
}

/** A public holiday the person has off, on a day in the period. */
export interface TimesheetHoliday {
  /** YYYY-MM-DD. */
  date: string;
  name: string;
  /** `"pm"`: only the afternoon is off. */
  part: "full" | "pm";
}

/** A message shown above the grid, with the tone of `Alert`'s variant. */
export interface TimesheetNotice {
  variant: "info" | "warning" | "error";
  message: string;
}

export interface ExpectedHoursResponse {
  /**
   * `null` when expected hours can't be worked out: the summary says so and
   * shows no target, remaining or over/under. The grid stays editable.
   */
  expectedHours: number | null;
  ptoHours: number;
  timeOffs: TimesheetTimeOff[];
  /** Listed under the grid and marked on the month calendar. */
  holidays?: TimesheetHoliday[];
  /** The hours holidays took off the expected hours; shown when above 0. */
  holidayHours?: number;
  /** Shown above the grid, whether or not `expectedHours` is known. */
  notice?: TimesheetNotice;
}

export interface SaveResponse {
  success: boolean;
  upserted: number;
  deleted: number;
  error?: string;
}

export interface TimesheetApi {
  fetchTimeEntries(params: {
    userId: number;
    startDate: string;
    endDate: string;
  }): Promise<TimeEntryResponse>;
  fetchExpectedHours(params: { startDate: string; endDate: string }): Promise<ExpectedHoursResponse>;
  saveTimesheet(entries: TimesheetEntry[]): Promise<SaveResponse>;
}

export type TimesheetViewMode = "weekly" | "monthly";

/** Hours by cell, keyed `${contractId}::${date}`. */
export type TimesheetGridData = Record<string, number | null>;

/**
 * The API `TimesheetTable` uses for any method the caller does not override:
 * `GET {baseUrl}/api/my-timesheets/entries`, `GET …/expected-hours` (both with
 * `startDate` and `endDate` query params) and `POST …/save` with `{ entries }`.
 * `extraHeaders` go on every request — an `Authorization` header, say.
 *
 * A failed save throws the response's `error` field when it has one.
 */
export function createDefaultApi(
  baseUrl: string = "",
  extraHeaders: Record<string, string> = {},
): TimesheetApi {
  const headers = (contentType?: string): Record<string, string> => ({
    ...extraHeaders,
    ...(contentType ? { "Content-Type": contentType } : {}),
  });

  return {
    async fetchTimeEntries(params): Promise<TimeEntryResponse> {
      const searchParams = new URLSearchParams({
        startDate: params.startDate,
        endDate: params.endDate,
      });
      const res = await fetch(`${baseUrl}/api/my-timesheets/entries?${searchParams}`, {
        headers: headers(),
      });
      if (!res.ok) throw new Error("Failed to fetch time entries");
      return res.json();
    },

    async fetchExpectedHours(params): Promise<ExpectedHoursResponse> {
      const searchParams = new URLSearchParams({
        startDate: params.startDate,
        endDate: params.endDate,
      });
      const res = await fetch(`${baseUrl}/api/my-timesheets/expected-hours?${searchParams}`, {
        headers: headers(),
      });
      if (!res.ok) throw new Error("Failed to fetch expected hours");
      return res.json();
    },

    async saveTimesheet(entries: TimesheetEntry[]): Promise<SaveResponse> {
      const res = await fetch(`${baseUrl}/api/my-timesheets/save`, {
        method: "POST",
        headers: headers("application/json"),
        body: JSON.stringify({ entries }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }
      return res.json();
    },
  };
}

/* ─────────────────────────── Internal helpers ─────────────────────────── */
// Used by the timesheet components; not exported from the package. Calendar
// arithmetic, `datePart` included, lives in `lib/calendar`.

export function cellKey(contractId: number, date: string): string {
  return `${contractId}::${date}`;
}

export function parseCellKey(key: string): { contractId: number; date: string } {
  const [contractIdStr, date] = key.split("::");
  return { contractId: parseInt(contractIdStr), date };
}

/**
 * The cells that differ between two grids, as the entries `saveTimesheet`
 * takes. A missing cell and a `null` one are the same (no hours), so typing a
 * value and clearing it again is no change.
 */
export function diffGrids(before: TimesheetGridData, after: TimesheetGridData): TimesheetEntry[] {
  const changed: TimesheetEntry[] = [];
  for (const key of new Set([...Object.keys(before), ...Object.keys(after)])) {
    const hours = after[key] ?? null;
    if (hours !== (before[key] ?? null)) {
      const { contractId, date } = parseCellKey(key);
      changed.push({ contractId, date, hours });
    }
  }
  return changed;
}

/** Whether a contract covers a day, both ends inclusive. */
export function contractCoversDay(contract: TimesheetContract, date: string): boolean {
  return date >= datePart(contract.startDate) && date <= datePart(contract.endDate);
}

/**
 * The position of the first time off covering a day, or `null`. That position
 * picks the entry's color, so the list and the grids agree. `endsAt` is the
 * return date, so it is exclusive.
 */
export function timeOffIndexForDay(date: string, timeOffs: TimesheetTimeOff[]): number | null {
  const index = timeOffs.findIndex((to) => date >= datePart(to.startsAt) && date < datePart(to.endsAt));
  return index === -1 ? null : index;
}

/**
 * A color, faded, as a background image rather than a color, so it lies over
 * the cell's own background (today, weekend, hover) instead of replacing it.
 */
function tintStyle(color: string): CSSProperties {
  const tint = `color-mix(in srgb, ${color} 20%, transparent)`;
  return { backgroundImage: `linear-gradient(${tint}, ${tint})` };
}

/** The tint for a day covered by the time off at `index`: its categorical color. */
export function timeOffTintStyle(index: number): CSSProperties {
  return tintStyle(getCategoricalColor(index));
}

/**
 * Every holiday's color: the warning amber, which no time off color is, so a
 * holiday never looks like somebody's time off (the palette starts blue).
 */
export const HOLIDAY_COLOR = "var(--color-warning)";

/** The tint for a holiday, full day or afternoon off. */
export function holidayTintStyle(): CSSProperties {
  return tintStyle(HOLIDAY_COLOR);
}

/**
 * The tint for a day in either grid, or `undefined`. A full-day holiday's color
 * wins over time off; time off wins over an afternoon-off holiday, since it
 * takes the morning too.
 */
export function dayTintStyle(
  date: string,
  timeOffs: TimesheetTimeOff[],
  holidays: TimesheetHoliday[],
): CSSProperties | undefined {
  const holiday = holidays.find((h) => h.date === date);
  if (holiday?.part === "full") return holidayTintStyle();
  const timeOffIndex = timeOffIndexForDay(date, timeOffs);
  if (timeOffIndex !== null) return timeOffTintStyle(timeOffIndex);
  return holiday ? holidayTintStyle() : undefined;
}
