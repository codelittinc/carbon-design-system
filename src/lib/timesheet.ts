/**
 * The data contract behind `TimesheetTable`: what it is given, what it fetches
 * and saves, and the fetch-based API it uses when the caller supplies none.
 *
 * Ported unchanged from the Backstage design system, so an app moving off it
 * keeps its call sites and its server routes. Dates are `YYYY-MM-DD` strings
 * (or ISO instants, of which only the date part is read) and are handled in UTC
 * throughout, so the host's zone never moves a day.
 */

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
  id: number;
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

export interface ExpectedHoursResponse {
  expectedHours: number;
  ptoHours: number;
  timeOffs: TimesheetTimeOff[];
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
// Used by the timesheet components; not exported from the package.

export function parseUTCDate(dateStr: string): Date {
  return new Date(dateStr + "T00:00:00.000Z");
}

export function toISODate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** The date part of an ISO date or instant. */
export function datePart(iso: string): string {
  return iso.split("T")[0];
}

export function getDaysInMonth(date: Date): number {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
}

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
}

export function getMonday(date: Date): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay();
  d.setUTCDate(d.getUTCDate() - day + (day === 0 ? -6 : 1));
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

export function formatShortDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

export function formatWeekRange(monday: Date): string {
  const sunday = addDays(monday, 6);
  const monStr = formatShortDate(monday);
  const sunStr = sunday.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  return `${monStr} – ${sunStr}`;
}

export function getFirstOfMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

export function getLastOfMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));
}

export function cellKey(contractId: number, date: string): string {
  return `${contractId}::${date}`;
}

export function parseCellKey(key: string): { contractId: number; date: string } {
  const [contractIdStr, date] = key.split("::");
  return { contractId: parseInt(contractIdStr), date };
}

/** Whether a contract covers a day, both ends inclusive. */
export function contractCoversDay(contract: TimesheetContract, date: string): boolean {
  return date >= datePart(contract.startDate) && date <= datePart(contract.endDate);
}
