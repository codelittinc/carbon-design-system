import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MonthGrid } from "../calendar-chrome";

const JULY = { year: 2026, month: 7 };

function headers(props: Partial<React.ComponentProps<typeof MonthGrid>> = {}): HTMLElement[] {
  render(
    <MonthGrid
      month={JULY}
      ariaLabel="Calendar, July 2026"
      today="2026-07-15"
      renderDay={(date) => date.day}
      {...props}
    />,
  );
  return within(screen.getByRole("table")).getAllByRole("columnheader");
}

describe("MonthGrid", () => {
  it("draws every weekday header in the muted text, weekends included (AA)", () => {
    for (const header of headers()) {
      expect(header).toHaveClass("text-text-muted");
      expect(header).not.toHaveClass("text-text-faint");
    }
  });

  it("dims the weekend headers only when asked to", () => {
    const all = headers({ dimWeekendHeaders: true });
    expect(all.slice(0, 5).every((h) => h.classList.contains("text-text-muted"))).toBe(true);
    expect(all.slice(5).map((h) => h.textContent)).toEqual(["Sat", "Sun"]);
    for (const weekend of all.slice(5)) expect(weekend).toHaveClass("text-text-faint");
  });
});
