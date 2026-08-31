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

/** How many days that month has, leap years included. */
export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
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
