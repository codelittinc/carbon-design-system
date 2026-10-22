import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DayRangePicker, nextDayRange, type DayRange } from "../day-range-picker";

const NOV = { year: 2026, month: 11 };
const BOUNDS = { min: { year: 2026, month: 10 }, max: { year: 2026, month: 12 } };
const EMPTY: DayRange = { start: null, end: null };

function setup(props: Partial<React.ComponentProps<typeof DayRangePicker>> = {}) {
  const onChange = vi.fn();
  const onMonthChange = vi.fn();
  render(
    <DayRangePicker
      month={NOV}
      onMonthChange={onMonthChange}
      value={EMPTY}
      onChange={onChange}
      {...BOUNDS}
      {...props}
    />,
  );
  return { onChange, onMonthChange };
}

const day = (name: string) => screen.getByRole("button", { name: new RegExp(`^${name}\\b`) });

describe("nextDayRange", () => {
  it("starts a range, ends it, and starts over after a whole one", () => {
    expect(nextDayRange(EMPTY, "2026-11-04")).toEqual({ start: "2026-11-04", end: null });
    expect(nextDayRange({ start: "2026-11-04", end: null }, "2026-11-09")).toEqual({
      start: "2026-11-04",
      end: "2026-11-09",
    });
    expect(nextDayRange({ start: "2026-11-04", end: "2026-11-09" }, "2026-11-20")).toEqual({
      start: "2026-11-20",
      end: null,
    });
  });

  it("the same day twice is a one-day range", () => {
    expect(nextDayRange({ start: "2026-11-04", end: null }, "2026-11-04")).toEqual({
      start: "2026-11-04",
      end: "2026-11-04",
    });
  });

  it("an earlier second click starts over from there rather than swapping the ends", () => {
    expect(nextDayRange({ start: "2026-11-09", end: null }, "2026-11-04")).toEqual({
      start: "2026-11-04",
      end: null,
    });
  });

  it("compares across months and years", () => {
    expect(nextDayRange({ start: "2026-12-30", end: null }, "2027-01-04")).toEqual({
      start: "2026-12-30",
      end: "2027-01-04",
    });
  });
});

describe("DayRangePicker", () => {
  it("reports clicks as the next range", () => {
    const { onChange } = setup({ value: { start: "2026-11-04", end: null } });
    fireEvent.click(day("9 November 2026"));
    expect(onChange).toHaveBeenCalledWith({ start: "2026-11-04", end: "2026-11-09" });
  });

  it("names the ends and the days between, and presses only the ends", () => {
    setup({ value: { start: "2026-11-04", end: "2026-11-06" } });
    expect(day("4 November 2026")).toHaveAccessibleName("4 November 2026, first day");
    expect(day("5 November 2026")).toHaveAccessibleName("5 November 2026, in range");
    expect(day("6 November 2026")).toHaveAccessibleName("6 November 2026, last day");
    expect(day("4 November 2026")).toHaveAttribute("aria-pressed", "true");
    expect(day("5 November 2026")).toHaveAttribute("aria-pressed", "false");
    expect(day("7 November 2026")).toHaveAccessibleName("7 November 2026");
  });

  it("a one-day range is both ends", () => {
    setup({ value: { start: "2026-11-04", end: "2026-11-04" } });
    expect(day("4 November 2026")).toHaveAccessibleName("4 November 2026, first and last day");
  });

  it("muted days say why, stay clickable, and weekends are muted on request", () => {
    const { onChange } = setup({ muted: { "2026-11-26": "Thanksgiving" }, muteWeekends: true });
    expect(day("26 November 2026")).toHaveAccessibleName("26 November 2026, Thanksgiving");
    expect(day("26 November 2026")).toHaveAttribute("title", "Thanksgiving");
    expect(day("28 November 2026")).toHaveAccessibleName("28 November 2026, weekend");
    expect(day("27 November 2026")).toHaveAccessibleName("27 November 2026");
    fireEvent.click(day("26 November 2026"));
    expect(onChange).toHaveBeenCalledWith({ start: "2026-11-26", end: null });
  });

  it("weekends are not muted unless asked", () => {
    setup();
    expect(day("28 November 2026")).toHaveAccessibleName("28 November 2026");
  });

  it("days outside firstDay and lastDay are disabled and say so", () => {
    setup({ firstDay: "2026-11-10", lastDay: "2026-11-20", unavailableLabel: "in the past" });
    expect(day("9 November 2026")).toBeDisabled();
    expect(day("9 November 2026")).toHaveAccessibleName("9 November 2026, in the past");
    expect(day("10 November 2026")).toBeEnabled();
    expect(day("21 November 2026")).toBeDisabled();
  });

  it("hovering previews the range while only the first day is picked", () => {
    setup({ value: { start: "2026-11-04", end: null } });
    fireEvent.mouseEnter(day("6 November 2026"));
    expect(day("5 November 2026")).toHaveClass("bg-accent-muted");
    // A preview is not a selection: nothing says "in range" until it's clicked.
    expect(day("5 November 2026")).toHaveAccessibleName("5 November 2026");
  });

  it("the preview follows keyboard focus, and goes when focus leaves", () => {
    setup({ value: { start: "2026-11-04", end: null } });
    fireEvent.focus(day("6 November 2026"));
    expect(day("5 November 2026")).toHaveClass("bg-accent-muted");
    fireEvent.blur(day("6 November 2026"));
    expect(day("5 November 2026")).not.toHaveClass("bg-accent-muted");
  });

  it("pages within min and max, and every button is type=button so a form never submits", () => {
    const { onMonthChange } = setup({ month: BOUNDS.max });
    expect(screen.getByRole("button", { name: "Next month" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Previous month" }));
    expect(onMonthChange).toHaveBeenCalledWith(NOV);
    for (const button of screen.getAllByRole("button")) expect(button).toHaveAttribute("type", "button");
  });
});
