import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MonthCalendar } from "../month-calendar";

const SEPT = { year: 2026, month: 9 };
const RANGE = { min: { year: 2026, month: 8 }, max: { year: 2026, month: 10 } };

function setup(props: Partial<React.ComponentProps<typeof MonthCalendar>> = {}) {
  const onSelect = vi.fn();
  const onMonthChange = vi.fn();
  render(
    <MonthCalendar
      month={SEPT}
      onMonthChange={onMonthChange}
      selected={null}
      onSelect={onSelect}
      {...RANGE}
      {...props}
    />,
  );
  return { onSelect, onMonthChange };
}

describe("MonthCalendar", () => {
  it("draws every day of the month", () => {
    setup();
    expect(screen.getByRole("button", { name: "1 September 2026" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "30 September 2026" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "31 September 2026" })).not.toBeInTheDocument();
  });

  it("knows how long February is in a leap year", () => {
    setup({ month: { year: 2028, month: 2 }, min: { year: 2028, month: 1 }, max: { year: 2028, month: 3 } });
    expect(screen.getByRole("button", { name: "29 February 2028" })).toBeInTheDocument();
  });

  it("reports the day as an ISO key", () => {
    const { onSelect } = setup();
    fireEvent.click(screen.getByRole("button", { name: "3 September 2026" }));
    expect(onSelect).toHaveBeenCalledWith("2026-09-03");
  });

  it("marks the selected day pressed", () => {
    setup({ selected: "2026-09-03" });
    expect(screen.getByRole("button", { name: "3 September 2026" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "4 September 2026" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("pages the month without touching the selection", () => {
    const { onMonthChange, onSelect } = setup({ selected: "2026-09-03" });
    fireEvent.click(screen.getByRole("button", { name: "Next month" }));
    expect(onMonthChange).toHaveBeenCalledWith({ year: 2026, month: 10 });
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("stops at the ends of the range rather than paging past them", () => {
    setup({ month: RANGE.min });
    expect(screen.getByRole("button", { name: "Previous month" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next month" })).toBeEnabled();
  });

  it("with no available set, every day is pickable", () => {
    setup();
    expect(screen.getByRole("button", { name: "3 September 2026" })).toBeEnabled();
  });

  it("with one, the rest are disabled rather than missing", () => {
    setup({ available: new Set(["2026-09-03"]) });
    expect(screen.getByRole("button", { name: "3 September 2026" })).toBeEnabled();

    const shut = screen.getByRole("button", { name: "4 September 2026, unavailable" });
    expect(shut).toBeDisabled();
    // Present, so the month keeps its shape and the reader can see the pattern
    // of what is on offer rather than a grid with holes punched in it.
    expect(shut).toBeInTheDocument();
  });

  /*
   * The regression this component was moved here with.
   *
   * `Button` renders a bare <button> and sets no default type, matching HTML, so
   * an unmarked one inside a <form> is implicitly type="submit". A consuming app
   * put this calendar in a form dialog and every cell — and both month arrows —
   * submitted it. On that dialog, submitting marked somebody for removal.
   */
  it("never submits the form it is placed in", () => {
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    render(
      <form onSubmit={onSubmit} aria-label="wrapper">
        <MonthCalendar
          month={SEPT}
          onMonthChange={() => {}}
          selected={null}
          onSelect={() => {}}
          {...RANGE}
        />
      </form>,
    );

    const form = screen.getByRole("form", { name: "wrapper" });
    fireEvent.click(within(form).getByRole("button", { name: "3 September 2026" }));
    fireEvent.click(within(form).getByRole("button", { name: "Next month" }));
    fireEvent.click(within(form).getByRole("button", { name: "Previous month" }));

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("every button says type=button, which is what keeps that true", () => {
    setup();
    for (const button of screen.getAllByRole("button")) {
      expect(button).toHaveAttribute("type", "button");
    }
  });

  it("is a labelled group, because it is not one control", () => {
    setup({ "aria-label": "Last working day" });
    expect(screen.getByRole("group", { name: "Last working day" })).toBeInTheDocument();
  });
});
