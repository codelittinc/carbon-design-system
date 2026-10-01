import { describe, expect, it } from "vitest";
import {
  compareMonths,
  dateKey,
  daysInMonth,
  monthLabel,
  monthOfKey,
  shiftMonth,
  todayIn,
  weekdayOf,
} from "../calendar";

describe("dateKey", () => {
  it("pads to ISO, so keys sort as days", () => {
    expect(dateKey({ year: 2026, month: 9, day: 3 })).toBe("2026-09-03");
    expect(dateKey({ year: 2026, month: 12, day: 31 })).toBe("2026-12-31");
  });
});

describe("weekdayOf", () => {
  it("is Monday-first", () => {
    // 31 August 2026 is a Monday, 6 September a Sunday.
    expect(weekdayOf({ year: 2026, month: 8, day: 31 })).toBe(0);
    expect(weekdayOf({ year: 2026, month: 9, day: 6 })).toBe(6);
  });

  it("answers from the calendar, not from an instant", () => {
    /*
     * The trap this module exists for. The naive spelling is
     * `new Date("2026-09-12").getDay()`, and that string parses as midnight
     * **UTC** — so west of Greenwich it reads back as the 11th, a different
     * weekday. Everything here is built AND read in UTC, so the two cancel and
     * the answer is the same wherever the test runs.
     *
     * 12 September 2026 is a Saturday: 5, Monday-first.
     */
    expect(weekdayOf({ year: 2026, month: 9, day: 12 })).toBe(5);
  });
});

describe("daysInMonth", () => {
  it("knows the short months and the leap years", () => {
    expect(daysInMonth(2026, 2)).toBe(28);
    expect(daysInMonth(2028, 2)).toBe(29);
    expect(daysInMonth(2000, 2)).toBe(29); // a 400-year leap year
    expect(daysInMonth(1900, 2)).toBe(28); // a century that is not one
    expect(daysInMonth(2026, 9)).toBe(30);
    expect(daysInMonth(2026, 12)).toBe(31);
  });
});

describe("shiftMonth", () => {
  it("rolls the year over in both directions", () => {
    expect(shiftMonth({ year: 2026, month: 12 }, 1)).toEqual({ year: 2027, month: 1 });
    expect(shiftMonth({ year: 2026, month: 1 }, -1)).toEqual({ year: 2025, month: 12 });
  });

  it("handles a step of more than a year", () => {
    expect(shiftMonth({ year: 2026, month: 6 }, 14)).toEqual({ year: 2027, month: 8 });
    expect(shiftMonth({ year: 2026, month: 6 }, -18)).toEqual({ year: 2024, month: 12 });
  });
});

describe("compareMonths", () => {
  it("orders by year, then month", () => {
    expect(compareMonths({ year: 2026, month: 1 }, { year: 2026, month: 2 })).toBeLessThan(0);
    expect(compareMonths({ year: 2027, month: 1 }, { year: 2026, month: 12 })).toBeGreaterThan(0);
    expect(compareMonths({ year: 2026, month: 5 }, { year: 2026, month: 5 })).toBe(0);
  });
});

describe("monthLabel", () => {
  it("names the month and the year", () => {
    expect(monthLabel({ year: 2026, month: 9 })).toBe("September 2026");
    expect(monthLabel({ year: 2026, month: 1 })).toBe("January 2026");
  });
});

describe("monthOfKey", () => {
  it("reads the month out of a day key", () => {
    expect(monthOfKey("2026-09-03")).toEqual({ year: 2026, month: 9 });
  });

  it("refuses anything that is not one", () => {
    expect(monthOfKey("")).toBeNull();
    expect(monthOfKey("03/09/2026")).toBeNull();
    expect(monthOfKey("2026-13-01")).toBeNull();
    expect(monthOfKey("2026-09-03T00:00:00Z")).toBeNull();
  });
});

describe("todayIn", () => {
  it("reads the reader's own calendar fields", () => {
    const now = new Date(2026, 8, 12, 23, 30);
    expect(todayIn(now)).toEqual({ year: 2026, month: 9, day: 12 });
  });
});
