/**
 * Calendar arithmetic — pure, zone-free, and no `Date` in any public shape.
 *
 * A calendar is not a list of instants. The 3rd of September is a Thursday
 * everywhere, and which month a grid is showing does not depend on who is
 * looking at it. Everything here works on `{ year, month, day }`, and the two
 * places a `Date` appears internally are pinned to UTC so the host's zone cannot
 * move a day.
 *
 * That is the whole reason this is not `new Date(iso)`: `new Date("2026-09-12")`
 * is midnight **UTC**, so reading `.getDate()` off it in Chicago returns 11.
 */

export interface YearMonth {
  year: number;
  /** 1–12, as people write months rather than as `Date` numbers them. */
  month: number;
}

export interface CalendarDate extends YearMonth {
  /** 1–31. */
  day: number;
}

/** `"2026-09-03"` — how a day is keyed wherever a calendar grid is involved. */
export function dateKey(date: CalendarDate): string {
  return `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
}

/**
 * Which weekday a date falls on, **0 = Monday**.
 *
 * Monday-first because that is what the grid draws. Deliberately zone-free: the
 * UTC round trip is what keeps the first column of the month from depending on
 * the reader.
 */
export function weekdayOf(date: CalendarDate): number {
  return (new Date(Date.UTC(date.year, date.month - 1, date.day)).getUTCDay() + 6) % 7;
}

/**
 * Column headings for a calendar grid. Monday-first, like `weekdayOf` and
 * `monthWeeks`: every grid in the package starts its week on Monday, and there
 * is no option to change it.
 */
export const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

/** Saturday or Sunday. */
export function isWeekend(date: CalendarDate): boolean {
  return weekdayOf(date) >= 5;
}

/** How many days that month has, leap years included. */
export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** The day `step` days away, rolling the month and year over in both directions. */
export function addDays(date: CalendarDate, step: number): CalendarDate {
  const d = new Date(Date.UTC(date.year, date.month - 1, date.day + step));
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

/** The Monday on or before `date`. */
export function startOfWeek(date: CalendarDate): CalendarDate {
  return addDays(date, -weekdayOf(date));
}

/**
 * A month as the weeks a calendar grid draws, Monday-first. Each week is seven
 * cells; the days before the 1st and after the last are `null`, so the grid
 * keeps its columns without showing the neighbouring months' days.
 *
 * This is the one grid layout in the package — `MonthCalendar`, `EventCalendar`
 * and `TimesheetTable`'s month view all draw from it.
 */
export function monthWeeks(month: YearMonth): (CalendarDate | null)[][] {
  const cells: (CalendarDate | null)[] = Array(weekdayOf({ ...month, day: 1 })).fill(null);
  for (let day = 1; day <= daysInMonth(month.year, month.month); day++) {
    cells.push({ ...month, day });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return Array.from({ length: cells.length / 7 }, (_, week) => cells.slice(week * 7, week * 7 + 7));
}

/** The month `step` months away, rolling the year over in both directions. */
export function shiftMonth(from: YearMonth, step: number): YearMonth {
  const zeroBased = from.month - 1 + step;
  return {
    year: from.year + Math.floor(zeroBased / 12),
    month: ((zeroBased % 12) + 12) % 12 + 1,
  };
}

/** Negative if `a` is before `b`, positive after, zero for the same month. */
export function compareMonths(a: YearMonth, b: YearMonth): number {
  return a.year !== b.year ? a.year - b.year : a.month - b.month;
}

/** `"September 2026"`, for a calendar heading. */
export function monthLabel({ year, month }: YearMonth): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

/**
 * A `"2026-09-03"` key back as a date, or null if it is not a real day. A full
 * ISO instant (`"2026-09-03T00:00:00.000Z"`) is read by its date part.
 */
export function parseDateKey(key: string): CalendarDate | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:T|$)/.exec(key);
  if (!match) return null;

  const date = { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
  return date.month >= 1 && date.month <= 12 && date.day >= 1 && date.day <= daysInMonth(date.year, date.month)
    ? date
    : null;
}

/**
 * A date written out with `Intl` options — `{ weekday: "short", month: "short",
 * day: "numeric" }` gives "Mon, Sep 14". Pinned to UTC, like everything here,
 * so the reader's zone cannot move the day.
 */
export function formatCalendarDate(date: CalendarDate, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("en-US", { ...options, timeZone: "UTC" }).format(
    new Date(Date.UTC(date.year, date.month - 1, date.day)),
  );
}

/** The month a `"2026-09-03"` key belongs to, or null if it is not one. */
export function monthOfKey(key: string): YearMonth | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!match) return null;

  const month = Number(match[2]);
  return month >= 1 && month <= 12 ? { year: Number(match[1]), month } : null;
}

/** Today, in the READER's zone — the only sensible place to open a picker. */
export function todayIn(now: Date = new Date()): CalendarDate {
  return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
}
