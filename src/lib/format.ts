import { formatCalendarDate, formatDateKey } from "./calendar";

/**
 * `1,234.50`, two decimals and grouped, with a negative in parentheses —
 * `$` in front unless `symbol` is false (`MoneyInput` draws its own).
 * Internal: the package exports `formatMoney`.
 */
export function formatAmount(value: number | string, { symbol = true }: { symbol?: boolean } = {}): string {
  if (typeof value === "number") {
    const abs = Math.abs(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const body = symbol ? `$${abs}` : abs;
    return value < 0 ? `(${body})` : body;
  }
  // Decimal strings must never pass through a float: database-sized amounts
  // exceed Number's exact range. Round absolute cents half up using integers.
  const match = /^([+-]?)(\d*)(?:\.(\d*))?(?:e([+-]?\d+))?$/i.exec(value.trim());
  if (!match || !(match[2] || match[3])) return symbol ? "$0.00" : "0.00";
  const exponent = Number(match[4] || "0");
  // Bound expansion for malformed inputs while supporting finite numeric strings.
  if (!Number.isSafeInteger(exponent) || Math.abs(exponent) > 1000) return symbol ? "$0.00" : "0.00";
  const digits = (match[2] || "0") + (match[3] || "");
  const point = (match[2] || "0").length + exponent;
  const whole = point > 0 ? digits.slice(0, point).padEnd(point, "0") : "0";
  const fraction = point < 0 ? "0".repeat(-point) + digits : digits.slice(point);
  let cents = BigInt(whole) * 100n + BigInt((fraction + "00").slice(0, 2));
  if ((fraction[2] || "0") >= "5") cents += 1n;
  const integer = (cents / 100n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const abs = `${integer}.${(cents % 100n).toString().padStart(2, "0")}`;
  const body = symbol ? `$${abs}` : abs;
  return match[1] === "-" && cents !== 0n ? `(${body})` : body;
}

export function formatMoney(value: string | number | null | undefined): string {
  if (value == null || value === "" || (typeof value === "number" && isNaN(value))) return "$0.00";
  return formatAmount(value);
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
