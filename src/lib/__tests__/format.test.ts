import { describe, expect, it } from "vitest";
import { formatDate, formatMoney, formatPeriodLabel } from "../format";

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
});

describe("formatPeriodLabel", () => {
  it("maps a 1-based month index to its short name plus the year", () => {
    expect(formatPeriodLabel(1, 2026)).toBe("Jan 2026");
    expect(formatPeriodLabel(7, 2026)).toBe("Jul 2026");
    expect(formatPeriodLabel(12, 2025)).toBe("Dec 2025");
  });
});
