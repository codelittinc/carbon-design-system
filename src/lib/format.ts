import { formatCalendarDate, formatDateKey } from "./calendar";

/**
 * `1,234.50`, two decimals and grouped, with a negative in parentheses —
 * `$` in front unless `symbol` is false (`MoneyInput` draws its own).
 * Internal: the package exports `formatMoney`.
 */
export function formatAmount(value: number, { symbol = true }: { symbol?: boolean } = {}): string {
  const abs = Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const body = symbol ? `$${abs}` : abs;
  return value < 0 ? `(${body})` : body;
}

export function formatMoney(value: string | number | null | undefined): string {
  if (value == null || value === "") return "$0.00";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "$0.00";
  return formatAmount(num);
}

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * `"Sep 12, 2026"`. A date-only `"2026-09-12"` is a calendar day and is shown
 * as that day wherever the reader is; `new Date()` would read it as midnight
 * UTC and show Sep 11 in the Americas. A full timestamp is an instant, shown in
 * the reader's zone.
 *
 * So a calendar day sent as a timestamp is shown a day early west of UTC: a
 * Prisma `@db.Date` column serializes as `"2026-09-12T00:00:00.000Z"`, which is
 * an instant here, not a day. Pass such a value as its date key
 * (`value.slice(0, 10)`, `"2026-09-12"`) and it is shown as that day.
 */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
  if (DATE_ONLY.test(iso)) return formatDateKey(iso, options);
  return new Date(iso).toLocaleDateString("en-US", options);
}

/** `"Sep"` for 9: the short month name every month label in the package uses. */
export function shortMonthName(month: number): string {
  return formatCalendarDate({ year: 2000, month, day: 1 }, { month: "short" });
}

export function formatPeriodLabel(month: number, year: number): string {
  return `${shortMonthName(month)} ${year}`;
}
