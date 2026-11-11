/**
 * The data contract behind `TimesheetTable`: what it is given, what it fetches
 * and saves, and the fetch-based API it uses when the caller supplies none.
 *
 * Ported unchanged from the Backstage design system, so an app moving off it
 * keeps its call sites and its server routes. Dates are `YYYY-MM-DD` strings
 * (or ISO instants, of which only the date part is read) and are handled in UTC
 * throughout, so the host's zone never moves a day.
 */

import { datePart } from "./calendar";

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
