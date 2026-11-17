import { describe, expect, it } from "vitest";
import {
  dayTintStyle,
  holidayTintStyle,
  timeOffIndexForDay,
  timeOffTintStyle,
  type TimesheetHoliday,
  type TimesheetTimeOff,
} from "../timesheet";

const VACATION: TimesheetTimeOff = { id: 1, type: "Vacation", startsAt: "2026-09-14", endsAt: "2026-09-17" };

describe("timeOffIndexForDay", () => {
  it("covers the start day up to, not including, endsAt", () => {
    expect(timeOffIndexForDay("2026-09-14", [VACATION])).toBe(0);
    expect(timeOffIndexForDay("2026-09-16", [VACATION])).toBe(0);
    expect(timeOffIndexForDay("2026-09-17", [VACATION])).toBeNull();
    expect(timeOffIndexForDay("2026-09-13", [VACATION])).toBeNull();
  });

  it("reads only the date part of an ISO instant", () => {
    const instant = { ...VACATION, startsAt: "2026-09-14T00:00:00.000Z", endsAt: "2026-09-17T00:00:00.000Z" };
    expect(timeOffIndexForDay("2026-09-14", [instant])).toBe(0);
    expect(timeOffIndexForDay("2026-09-17", [instant])).toBeNull();
  });

  it("picks the first entry covering the day", () => {
    const sick = { id: "b", type: "Sick", startsAt: "2026-09-15", endsAt: "2026-09-16" };
    expect(timeOffIndexForDay("2026-09-15", [VACATION, sick])).toBe(0);
    expect(timeOffIndexForDay("2026-09-15", [sick, VACATION])).toBe(0);
    expect(timeOffIndexForDay("2026-09-14", [sick, VACATION])).toBe(1);
  });

  it("is null without time off", () => {
    expect(timeOffIndexForDay("2026-09-14", [])).toBeNull();
  });
});

describe("timeOffTintStyle", () => {
  it("lays the entry's category color, faded, over the background as an image", () => {
    const tint = "color-mix(in srgb, var(--color-category-1) 20%, transparent)";
    expect(timeOffTintStyle(0)).toEqual({ backgroundImage: `linear-gradient(${tint}, ${tint})` });
    expect(timeOffTintStyle(1).backgroundImage).toContain("var(--color-category-2)");
    expect(timeOffTintStyle(11)).toEqual(timeOffTintStyle(0));
    expect(timeOffTintStyle(0)).not.toHaveProperty("backgroundColor");
  });
});

describe("holidayTintStyle", () => {
  it("lays the info color, faded, over the background as an image", () => {
    const tint = "color-mix(in srgb, var(--color-warning) 20%, transparent)";
    expect(holidayTintStyle()).toEqual({ backgroundImage: `linear-gradient(${tint}, ${tint})` });
    expect(holidayTintStyle().backgroundImage).not.toContain("--color-category-");
  });
});

describe("dayTintStyle", () => {
  const FULL: TimesheetHoliday = { date: "2026-09-15", name: "Founders Day", part: "full" };
  const PM: TimesheetHoliday = { date: "2026-09-16", name: "Harvest Eve", part: "pm" };
  const LATER_PM: TimesheetHoliday = { date: "2026-09-18", name: "Market Day", part: "pm" };

  it("tints a holiday with the holiday color, full day or afternoon off", () => {
    expect(dayTintStyle("2026-09-15", [], [FULL])).toEqual(holidayTintStyle());
    expect(dayTintStyle("2026-09-18", [], [LATER_PM])).toEqual(holidayTintStyle());
  });

  it("tints time off with its entry's color", () => {
    expect(dayTintStyle("2026-09-14", [VACATION], [])).toEqual(timeOffTintStyle(0));
  });

  it("lets a full-day holiday win over time off", () => {
    expect(dayTintStyle("2026-09-15", [VACATION], [FULL, PM])).toEqual(holidayTintStyle());
  });

  it("lets an afternoon-off holiday win over time off too", () => {
    expect(dayTintStyle("2026-09-16", [VACATION], [FULL, PM])).toEqual(holidayTintStyle());
  });

  it("leaves any other day untinted", () => {
    expect(dayTintStyle("2026-09-17", [VACATION], [FULL, PM])).toBeUndefined();
    expect(dayTintStyle("2026-09-14", [], [])).toBeUndefined();
  });
});
