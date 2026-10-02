import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EventCalendar } from "../event-calendar";

interface Item {
  id: number;
  name: string;
}

const ITEMS = new Map<string, Item[]>([
  ["2026-07-03", [{ id: 1, name: "Jane" }]],
  [
    "2026-07-14",
    [
      { id: 2, name: "Ana" },
      { id: 3, name: "Bo" },
      { id: 4, name: "Cy" },
      { id: 5, name: "Di" },
      { id: 6, name: "Ed" },
    ],
  ],
]);

function renderCalendar(props: Partial<React.ComponentProps<typeof EventCalendar<Item>>> = {}) {
  const onMonthChange = vi.fn();
  render(
    <EventCalendar<Item>
      month={{ year: 2026, month: 7 }}
      onMonthChange={onMonthChange}
      itemsByDate={ITEMS}
      renderItem={(item) => <span>{item.name}</span>}
      itemKey={(item) => item.id}
      {...props}
    />,
  );
  return { onMonthChange };
}

describe("EventCalendar", () => {
  it("lays the month out Monday-first in whole weeks, blank outside the month", () => {
    renderCalendar();
    expect(screen.getByRole("heading", { name: "July 2026" })).toBeInTheDocument();
    expect(screen.getAllByText(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)$/).map((el) => el.textContent)).toEqual([
      "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun",
    ]);
    const grid = screen.getByRole("grid", { name: "Calendar, July 2026" });
    const rows = within(grid).getAllByRole("row");
    // 1 July 2026 is a Wednesday: 2 blanks + 31 days + 2 blanks = 35.
    expect(rows).toHaveLength(5);
    const first = within(rows[0]).getAllByRole("gridcell");
    expect(first[0]).not.toHaveAccessibleName();
    expect(first[0]).toBeEmptyDOMElement();
    expect(first[2]).toHaveAccessibleName("Wednesday, July 1");
    const last = within(rows[4]).getAllByRole("gridcell");
    expect(last[4]).toHaveAccessibleName("Friday, July 31");
    expect(last[5]).toBeEmptyDOMElement();
  });

  it("renders a day's items, folding the rest into +N more", () => {
    renderCalendar();
    const day = screen.getByRole("gridcell", { name: "Tuesday, July 14" });
    expect(within(day).getByText("Ana")).toBeInTheDocument();
    expect(within(day).queryByText("Di")).not.toBeInTheDocument();

    fireEvent.click(within(day).getByRole("button", { name: "Show 2 more items on July 14" }));
    const list = screen.getByRole("dialog", { name: "Items on July 14" });
    expect(within(list).getByText("Tue, Jul 14 — 5 items")).toBeInTheDocument();
    expect(within(list).getByText("Ed")).toBeInTheDocument();
  });

  it("honors maxVisibleItems and the overflow label callbacks", () => {
    renderCalendar({
      maxVisibleItems: 1,
      overflowAriaLabel: (iso, n) => `${n} more people on ${iso}`,
      overflowPopoverTitle: (iso, n) => `${n} people`,
    });
    fireEvent.click(screen.getByRole("button", { name: "4 more people on 2026-07-14" }));
    expect(screen.getByText("5 people")).toBeInTheDocument();
  });

  it("pages months and returns to the current one", () => {
    const { onMonthChange } = renderCalendar();
    fireEvent.click(screen.getByRole("button", { name: "Previous month" }));
    expect(onMonthChange).toHaveBeenLastCalledWith({ year: 2026, month: 6 });
    fireEvent.click(screen.getByRole("button", { name: "Next month" }));
    expect(onMonthChange).toHaveBeenLastCalledWith({ year: 2026, month: 8 });
    fireEvent.click(screen.getByRole("button", { name: "Today" }));
    const now = new Date();
    // Today in the reader's zone, as `todayIn` reads it.
    expect(onMonthChange).toHaveBeenLastCalledWith({ year: now.getFullYear(), month: now.getMonth() + 1 });
  });

  it("rolls the year over", () => {
    const { onMonthChange } = renderCalendar({ month: { year: 2026, month: 12 } });
    fireEvent.click(screen.getByRole("button", { name: "Next month" }));
    expect(onMonthChange).toHaveBeenLastCalledWith({ year: 2027, month: 1 });
  });

  it("disables navigation and shows a spinner while loading", () => {
    renderCalendar({ loading: true });
    expect(screen.getByRole("button", { name: "Previous month" })).toBeDisabled();
    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
  });
});
