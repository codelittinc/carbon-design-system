import { describe, expect, it } from "vitest";
import {
  WEEKDAY_LABELS,
  addDays,
  compareMonths,
  dateKey,
  daysInMonth,
  formatCalendarDate,
  isWeekend,
  monthLabel,
  datePart,
  monthKey,
  monthOfKey,
  monthWeeks,
  parseDateKey,
  parseMonthKey,
  formatDateKey,
  shiftMonth,
  startOfWeek,
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

  it("reads an ISO instant by its date part, as parseDateKey does", () => {
    expect(monthOfKey("2026-09-03T00:00:00Z")).toEqual({ year: 2026, month: 9 });
  });

  it("refuses anything that is not a real day", () => {
    expect(monthOfKey("")).toBeNull();
    expect(monthOfKey("03/09/2026")).toBeNull();
    expect(monthOfKey("2026-13-01")).toBeNull();
    expect(monthOfKey("2026-02-30")).toBeNull();
  });
});

describe("monthKey / parseMonthKey", () => {
  it("round-trips a month", () => {
    expect(monthKey({ year: 2026, month: 9 })).toBe("2026-09");
    expect(parseMonthKey("2026-09")).toEqual({ year: 2026, month: 9 });
  });

  it("refuses a key that is not a month", () => {
    expect(parseMonthKey("2026-13")).toBeNull();
    expect(parseMonthKey("2026-9")).toBeNull();
    expect(parseMonthKey("")).toBeNull();
  });
});

describe("datePart", () => {
  it("keeps a day key and cuts an instant to its day", () => {
    expect(datePart("2026-09-03")).toBe("2026-09-03");
    expect(datePart("2026-09-03T23:30:00.000Z")).toBe("2026-09-03");
  });

  it("cuts a value that is not a real day at its T", () => {
    expect(datePart("2026-02-30T00:00:00Z")).toBe("2026-02-30");
  });
});

describe("todayIn", () => {
  it("reads the reader's own calendar fields", () => {
    const now = new Date(2026, 8, 12, 23, 30);
    expect(todayIn(now)).toEqual({ year: 2026, month: 9, day: 12 });
  });
});

describe("WEEKDAY_LABELS", () => {
  it("starts on Monday, like weekdayOf", () => {
    expect(WEEKDAY_LABELS[0]).toBe("Mon");
    expect(WEEKDAY_LABELS[6]).toBe("Sun");
  });
});

describe("addDays and startOfWeek", () => {
  it("rolls over months and years in both directions", () => {
    expect(addDays({ year: 2026, month: 12, day: 30 }, 3)).toEqual({ year: 2027, month: 1, day: 2 });
    expect(addDays({ year: 2026, month: 3, day: 1 }, -1)).toEqual({ year: 2026, month: 2, day: 28 });
  });

  it("finds the Monday on or before a day", () => {
    // 6 September 2026 is a Sunday; its week began on Monday 31 August.
    expect(startOfWeek({ year: 2026, month: 9, day: 6 })).toEqual({ year: 2026, month: 8, day: 31 });
    expect(startOfWeek({ year: 2026, month: 8, day: 31 })).toEqual({ year: 2026, month: 8, day: 31 });
  });
});

describe("isWeekend", () => {
  it("is Saturday and Sunday only", () => {
    expect(isWeekend({ year: 2026, month: 9, day: 5 })).toBe(true);
    expect(isWeekend({ year: 2026, month: 9, day: 6 })).toBe(true);
    expect(isWeekend({ year: 2026, month: 9, day: 7 })).toBe(false);
  });
});

describe("monthWeeks", () => {
  it("lays a month out Monday-first in whole weeks, blank outside it", () => {
    // 1 July 2026 is a Wednesday; the 31st a Friday.
    const weeks = monthWeeks({ year: 2026, month: 7 });
    expect(weeks).toHaveLength(5);
    weeks.forEach((week) => expect(week).toHaveLength(7));
    expect(weeks[0].slice(0, 3)).toEqual([null, null, { year: 2026, month: 7, day: 1 }]);
    expect(weeks[4].slice(4)).toEqual([{ year: 2026, month: 7, day: 31 }, null, null]);
  });

  it("needs no padding for a month that starts on Monday and ends on Sunday", () => {
    // February 2027 runs Monday 1st to Sunday 28th.
    const weeks = monthWeeks({ year: 2027, month: 2 });
    expect(weeks).toHaveLength(4);
    expect(weeks.flat().every(Boolean)).toBe(true);
  });
});

describe("parseDateKey", () => {
  it("reads a key, or the date part of an instant", () => {
    expect(parseDateKey("2026-09-03")).toEqual({ year: 2026, month: 9, day: 3 });
    expect(parseDateKey("2026-09-03T23:00:00.000Z")).toEqual({ year: 2026, month: 9, day: 3 });
  });

  it("rejects days that do not exist", () => {
    expect(parseDateKey("2026-02-29")).toBeNull();
    expect(parseDateKey("2026-13-01")).toBeNull();
    expect(parseDateKey("not a date")).toBeNull();
  });
});

describe("formatCalendarDate", () => {
  it("formats the calendar day, whatever the zone", () => {
    expect(
      formatCalendarDate({ year: 2026, month: 9, day: 14 }, { weekday: "short", month: "short", day: "numeric" }),
    ).toBe("Mon, Sep 14");
  });
});

describe("formatDateKey", () => {
  it("writes a key or an ISO instant out by its date part, in any zone", () => {
    expect(formatDateKey("2026-09-14", { weekday: "short", month: "short", day: "numeric" })).toBe("Mon, Sep 14");
    expect(formatDateKey("2026-09-14T23:30:00.000Z", { month: "long", day: "numeric" })).toBe("September 14");
  });

  it("hands back what it was given when that is not a day", () => {
    expect(formatDateKey("soon", { month: "short" })).toBe("soon");
  });
});
