import { afterEach, describe, expect, it, vi } from "vitest";
import { formatAmount, formatDate, formatMoney, formatPeriodLabel, shortMonthName } from "../format";

describe("formatMoney", () => {
  it("returns $0.00 for null, undefined, empty, and NaN inputs", () => {
    expect(formatMoney(null)).toBe("$0.00");
    expect(formatMoney(undefined)).toBe("$0.00");
    expect(formatMoney("")).toBe("$0.00");
    expect(formatMoney("not-a-number")).toBe("$0.00");
    expect(formatMoney(NaN)).toBe("$0.00");
  });

  it("formats positive numbers and numeric strings with two decimals", () => {
    expect(formatMoney(5)).toBe("$5.00");
    expect(formatMoney("12.5")).toBe("$12.50");
    expect(formatMoney(0)).toBe("$0.00");
  });

  it("wraps negative values in parentheses", () => {
    expect(formatMoney(-5)).toBe("($5.00)");
    expect(formatMoney("-12.5")).toBe("($12.50)");
  });

  it("adds thousands separators", () => {
    expect(formatMoney(1234.5)).toBe("$1,234.50");
    expect(formatMoney(-1234567.89)).toBe("($1,234,567.89)");
  });
});

describe("formatDate", () => {
  it("returns an em dash for null or undefined", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDate(undefined)).toBe("—");
    expect(formatDate("")).toBe("—");
  });

  it("formats a valid local ISO date as short month, day, year", () => {
    // Local (no Z) so the calendar day is timezone-stable.
    expect(formatDate("2026-07-25T00:00:00")).toBe("Jul 25, 2026");
    expect(formatDate("2026-01-01T12:00:00")).toBe("Jan 1, 2026");
  });

  describe("west of UTC", () => {
    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it("shows a date-only string as that calendar day, not the day before", () => {
      // new Date("2026-09-12") is midnight UTC: Sep 11 in Chicago.
      vi.stubEnv("TZ", "America/Chicago");
      expect(formatDate("2026-09-12")).toBe("Sep 12, 2026");
      expect(formatDate("2026-01-01")).toBe("Jan 1, 2026");
    });

    it("shows a midnight-UTC timestamp as an instant, and its date key as the day (documented)", () => {
      // A Prisma date-only column arrives as a timestamp. formatDate reads it
      // as the instant it is; the docs say to pass its date key instead.
      vi.stubEnv("TZ", "America/Chicago");
      const prismaDate = "2026-09-12T00:00:00.000Z";
      expect(formatDate(prismaDate)).toBe("Sep 11, 2026");
      expect(formatDate(prismaDate.slice(0, 10))).toBe("Sep 12, 2026");
    });
  });
});

describe("formatAmount", () => {
  it("is formatMoney's number, with or without the symbol", () => {
    expect(formatAmount(1234.5)).toBe("$1,234.50");
    expect(formatAmount(-1234.5)).toBe("($1,234.50)");
    expect(formatAmount(1234.5, { symbol: false })).toBe("1,234.50");
    expect(formatAmount(-5, { symbol: false })).toBe("(5.00)");
  });
});

describe("shortMonthName", () => {
  it("names every month", () => {
    expect(Array.from({ length: 12 }, (_, i) => shortMonthName(i + 1))).toEqual([
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ]);
  });
});

describe("formatPeriodLabel", () => {
  it("maps a 1-based month index to its short name plus the year", () => {
    expect(formatPeriodLabel(1, 2026)).toBe("Jan 2026");
    expect(formatPeriodLabel(7, 2026)).toBe("Jul 2026");
    expect(formatPeriodLabel(12, 2025)).toBe("Dec 2025");
  });
});
