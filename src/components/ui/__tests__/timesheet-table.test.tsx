import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  TimesheetTable,
  createDefaultApi,
  type TimesheetApi,
  type TimesheetContract,
  type TimesheetHoliday,
  type TimesheetTimeOff,
} from "../timesheet-table";

const CONTRACTS: TimesheetContract[] = [
  {
    id: 1,
    name: "Development",
    projectName: "Backstage",
    customerName: "Codelitt",
    startDate: "2026-01-01T00:00:00.000Z",
    endDate: "2026-12-31T00:00:00.000Z",
    projectActive: true,
  },
  {
    id: 2,
    name: "Support",
    projectName: "Legacy",
    customerName: "Globex",
    // Ends mid-week, so its later cells are outside the contract.
    startDate: "2026-01-01T00:00:00.000Z",
    endDate: "2026-09-16T00:00:00.000Z",
    projectActive: true,
  },
  {
    id: 3,
    name: "Old",
    projectName: "Inactive project",
    customerName: "Acme",
    startDate: "2026-01-01T00:00:00.000Z",
    endDate: "2026-12-31T00:00:00.000Z",
    projectActive: false,
  },
];

/** A Monday, so the week shown is 14–20 September 2026. */
const WEEK = "2026-09-14";

function mockApi(overrides: Partial<TimesheetApi> = {}): TimesheetApi {
  return {
    fetchTimeEntries: vi.fn(async () => ({
      timeEntries: [
        { id: 1, date: "2026-09-14T00:00:00.000Z", hours: 6, userId: 7, contractId: 1 },
        { id: 2, date: "2026-09-15", hours: 2, userId: 7, contractId: 2 },
      ],
    })),
    fetchExpectedHours: vi.fn(async () => ({ expectedHours: 40, ptoHours: 0, timeOffs: [] })),
    saveTimesheet: vi.fn(async (entries) => ({
      success: true,
      upserted: entries.length,
      deleted: 0,
    })),
    ...overrides,
  };
}

function renderTable(api: TimesheetApi, props: Partial<React.ComponentProps<typeof TimesheetTable>> = {}) {
  return render(
    <TimesheetTable
      userId={7}
      userFullName="Jane Smith"
      contracts={CONTRACTS}
      api={api}
      initialWeek={WEEK}
      {...props}
    />,
  );
}

/**
 * A weekly or day-panel input; `timeOff` is the type of the time off covering
 * the day, `holiday` the label's text after ", holiday: ".
 */
const cell = (project: string, day: string, timeOff?: string, holiday?: string) =>
  screen.getByLabelText(
    `Hours for ${project} on ${day}${timeOff ? `, time off: ${timeOff}` : ""}${holiday ? `, holiday: ${holiday}` : ""}`,
  ) as HTMLInputElement;

describe("TimesheetTable", () => {
  it("fetches the week and renders the grid from the api", async () => {
    const api = mockApi();
    renderTable(api);

    expect(screen.getByRole("status", { name: "Loading timesheet..." })).toBeInTheDocument();
    await screen.findByText("Daily Total");

    expect(api.fetchTimeEntries).toHaveBeenCalledWith({
      userId: 7,
      startDate: "2026-09-14",
      endDate: "2026-09-20",
    });
    expect(api.fetchExpectedHours).toHaveBeenCalledWith({
      startDate: "2026-09-14",
      endDate: "2026-09-20",
    });

    expect(screen.getByRole("heading", { name: "My Timesheets" })).toBeInTheDocument();
    expect(screen.getByText("Sep 14 – Sep 20, 2026")).toBeInTheDocument();
    expect(cell("Backstage", "Mon, Sep 14, 2026").value).toBe("6");
    expect(cell("Legacy", "Tue, Sep 15, 2026").value).toBe("2");
    // Outside the contract's dates, the cell cannot be edited.
    expect(cell("Legacy", "Thu, Sep 17, 2026")).toBeDisabled();
    // Contracts on an inactive project are left out.
    expect(screen.queryByText("Inactive project")).not.toBeInTheDocument();

    const totals = screen.getByText("Daily Total").closest("tr")!;
    expect(within(totals).getAllByRole("cell").at(-1)).toHaveTextContent("8");
    expect(screen.getByText("32h remaining")).toBeInTheDocument();
    // 8 of 40 expected hours: a Progress, short of the target, so the error tone.
    const progress = screen.getByRole("progressbar", { name: "Hours logged of expected" });
    expect(progress.firstElementChild).toHaveClass("bg-error");
    expect(progress.firstElementChild).toHaveStyle({ width: "20%" });
  });

  it("saves only the edited cells through the api, then offers a revert", async () => {
    const api = mockApi();
    renderTable(api);
    await screen.findByText("Daily Total");

    fireEvent.change(cell("Backstage", "Wed, Sep 16, 2026"), { target: { value: "7.5" } });
    fireEvent.change(cell("Backstage", "Mon, Sep 14, 2026"), { target: { value: "" } });
    // Out of range: ignored.
    fireEvent.change(cell("Backstage", "Thu, Sep 17, 2026"), { target: { value: "30" } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Save" }));
    });

    expect(api.saveTimesheet).toHaveBeenCalledOnce();
    expect(vi.mocked(api.saveTimesheet).mock.calls[0][0]).toEqual(
      expect.arrayContaining([
        { contractId: 1, date: "2026-09-16", hours: 7.5 },
        { contractId: 1, date: "2026-09-14", hours: null },
      ]),
    );
    expect(vi.mocked(api.saveTimesheet).mock.calls[0][0]).toHaveLength(2);
    expect(screen.getByText("Saved")).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Revert" }));
    });
    expect(vi.mocked(api.saveTimesheet).mock.calls[1][0]).toEqual(
      expect.arrayContaining([
        { contractId: 1, date: "2026-09-16", hours: null },
        { contractId: 1, date: "2026-09-14", hours: 6 },
      ]),
    );
    expect(cell("Backstage", "Mon, Sep 14, 2026").value).toBe("6");
  });

  it("switches to the monthly view and refetches the month", async () => {
    const api = mockApi();
    const onViewChange = vi.fn();
    const onNavigate = vi.fn();
    renderTable(api, { onViewChange, onNavigate });
    await screen.findByText("Daily Total");
    expect(onNavigate).toHaveBeenLastCalledWith({ view: "weekly", week: "2026-09-14" });

    await act(async () => {
      fireEvent.click(screen.getByRole("radio", { name: "Monthly" }));
    });
    await screen.findByText("September 2026");

    expect(onViewChange).toHaveBeenCalledWith("monthly");
    expect(onNavigate).toHaveBeenLastCalledWith({ view: "monthly", month: "2026-09" });
    expect(api.fetchTimeEntries).toHaveBeenLastCalledWith({
      userId: 7,
      startDate: "2026-09-01",
      endDate: "2026-09-30",
    });
    expect(screen.getByRole("radio", { name: "Monthly" })).toHaveAttribute("aria-checked", "true");

    // A day's total shows on the calendar; with two contracts, selecting it
    // opens the day panel.
    const monday = await screen.findByRole("button", { name: /^Mon, Sep 14, 2026, 6 hours/ });
    // The month is a table, with the day buttons in named cells, like EventCalendar's.
    const month = screen.getByRole("table", { name: "Hours, September 2026" });
    expect(within(month).getAllByRole("columnheader")).toHaveLength(7);
    // The timesheet keeps its dimmed weekend headers (MonthGrid's opt-in).
    expect(within(month).getByRole("columnheader", { name: "Sat" })).toHaveClass("text-text-faint");
    expect(within(month).getByRole("columnheader", { name: "Mon" })).toHaveClass("text-text-muted");
    expect(within(month).getByRole("cell", { name: "Monday, September 14" })).toContainElement(monday);
    expect(screen.getByRole("button", { name: "Next month" })).toHaveAttribute("type", "button");
    fireEvent.click(monday);
    expect(screen.getByRole("heading", { name: "Monday, Sep 14, 2026" })).toBeInTheDocument();
    expect(cell("Legacy", "Mon, Sep 14, 2026")).toBeEnabled();
  });

  it("pages to the next week", async () => {
    const api = mockApi();
    renderTable(api);
    await screen.findByText("Daily Total");

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Next week" }));
    });
    await screen.findByText("Sep 21 – Sep 27, 2026");
    expect(api.fetchTimeEntries).toHaveBeenLastCalledWith(
      expect.objectContaining({ startDate: "2026-09-21", endDate: "2026-09-27" }),
    );
  });

  it("shows an error with a retry when loading fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchTimeEntries = vi
      .fn()
      .mockRejectedValueOnce(new Error("boom"))
      .mockResolvedValue({ timeEntries: [] });
    const api = mockApi({ fetchTimeEntries });
    renderTable(api);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Failed to load time entries");
    expect(screen.queryByText("Daily Total")).not.toBeInTheDocument();

    await act(async () => {
      fireEvent.click(within(alert).getByRole("button", { name: "Try again" }));
    });
    await screen.findByText("Daily Total");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("falls back to the default api for methods not overridden", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ timeEntries: [] })));
    vi.stubGlobal("fetch", fetchMock);
    try {
      renderTable(mockApi({ fetchTimeEntries: undefined }) as TimesheetApi, {
        baseUrl: "https://example.test",
        apiHeaders: { Authorization: "Bearer t" },
      });
      await waitFor(() => expect(fetchMock).toHaveBeenCalled());
      const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
      expect(url).toBe(
        "https://example.test/api/my-timesheets/entries?startDate=2026-09-14&endDate=2026-09-20",
      );
      expect(init.headers).toEqual({ Authorization: "Bearer t" });
      await screen.findByText("Daily Total");
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

describe("TimesheetTable save, revert and dirty state", () => {
  it("stays on the period with the edits kept when the save before navigating fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const api = mockApi({ saveTimesheet: vi.fn().mockRejectedValue(new Error("Locked period")) });
    renderTable(api);
    await screen.findByText("Daily Total");

    fireEvent.change(cell("Backstage", "Wed, Sep 16, 2026"), { target: { value: "5" } });

    for (const control of [
      () => screen.getByRole("button", { name: "Next week" }),
      () => screen.getByRole("button", { name: "Previous week" }),
      () => screen.getByRole("button", { name: "Today" }),
      () => screen.getByRole("radio", { name: "Monthly" }),
    ]) {
      await act(async () => {
        fireEvent.click(control());
      });
      expect(screen.getByText("Sep 14 – Sep 20, 2026")).toBeInTheDocument();
      expect(cell("Backstage", "Wed, Sep 16, 2026").value).toBe("5");
      expect(screen.getByRole("button", { name: "Save" })).toBeEnabled();
    }
    expect(api.saveTimesheet).toHaveBeenCalledTimes(4);
    expect(api.fetchTimeEntries).toHaveBeenCalledOnce();
    expect(screen.getByRole("radio", { name: "Weekly" })).toHaveAttribute("aria-checked", "true");
  });

  it("keeps edits when the parent re-renders with fresh inline api, headers and onNavigate", async () => {
    const api = mockApi();
    const firstNavigate = vi.fn();
    const { rerender } = renderTable(api, { apiHeaders: { "X-A": "1" }, onNavigate: firstNavigate });
    await screen.findByText("Daily Total");
    fireEvent.change(cell("Backstage", "Wed, Sep 16, 2026"), { target: { value: "4" } });

    const secondNavigate = vi.fn();
    rerender(
      <TimesheetTable
        userId={7}
        userFullName="Jane Smith"
        contracts={CONTRACTS}
        api={{ ...api }}
        apiHeaders={{ "X-A": "1" }}
        onNavigate={secondNavigate}
        initialWeek={WEEK}
      />,
    );
    await act(async () => {});

    expect(api.fetchTimeEntries).toHaveBeenCalledOnce();
    expect(cell("Backstage", "Wed, Sep 16, 2026").value).toBe("4");
    expect(firstNavigate).toHaveBeenCalledOnce();
    expect(secondNavigate).not.toHaveBeenCalled();

    // The latest callbacks are the ones used from then on.
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Next week" }));
    });
    expect(secondNavigate).toHaveBeenLastCalledWith({ view: "weekly", week: "2026-09-21" });
  });

  it("leaves the grid dirty with Save after a failed revert, and Save resends it", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const saveTimesheet = vi
      .fn()
      .mockResolvedValueOnce({ success: true, upserted: 1, deleted: 0 })
      .mockRejectedValueOnce(new Error("Network down"))
      .mockResolvedValue({ success: true, upserted: 1, deleted: 0 });
    const api = mockApi({ saveTimesheet });
    renderTable(api);
    await screen.findByText("Daily Total");

    fireEvent.change(cell("Backstage", "Wed, Sep 16, 2026"), { target: { value: "3" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Save" }));
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Revert" }));
    });

    // The server still has 3; the grid shows the reverted value, unsaved.
    expect(cell("Backstage", "Wed, Sep 16, 2026").value).toBe("");
    expect(screen.getByRole("button", { name: "Save" })).toBeEnabled();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Save" }));
    });
    expect(saveTimesheet).toHaveBeenLastCalledWith([{ contractId: 1, date: "2026-09-16", hours: null }]);
    expect(screen.queryByRole("button", { name: "Save" })).not.toBeInTheDocument();
  });

  it("is not dirty after typing into an empty cell and clearing it again", async () => {
    renderTable(mockApi());
    await screen.findByText("Daily Total");
    const wed = cell("Backstage", "Wed, Sep 16, 2026");
    fireEvent.change(wed, { target: { value: "5" } });
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    fireEvent.change(wed, { target: { value: "" } });
    expect(screen.queryByRole("button", { name: "Save" })).not.toBeInTheDocument();
  });
});

describe("TimesheetTable keyboard", () => {
  it("moves between weekly cells with ArrowLeft and ArrowRight from the value's edge", async () => {
    renderTable(mockApi());
    await screen.findByText("Daily Total");

    const tue = cell("Backstage", "Tue, Sep 15, 2026");
    tue.focus();
    fireEvent.keyDown(tue, { key: "ArrowRight" });
    expect(cell("Backstage", "Wed, Sep 16, 2026")).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, { key: "ArrowLeft" });
    expect(tue).toHaveFocus();

    // Mid-value, the caret moves instead.
    fireEvent.change(tue, { target: { value: "12" } });
    tue.setSelectionRange(1, 1);
    fireEvent.keyDown(tue, { key: "ArrowRight" });
    expect(tue).toHaveFocus();
  });

  it("takes a decimal typed a character at a time, and ignores anything else", async () => {
    renderTable(mockApi());
    await screen.findByText("Daily Total");
    const wed = cell("Backstage", "Wed, Sep 16, 2026");
    expect(wed).toHaveAttribute("inputmode", "decimal");
    wed.focus();
    fireEvent.change(wed, { target: { value: "7." } });
    expect(wed.value).toBe("7.");
    fireEvent.change(wed, { target: { value: "7.5" } });
    expect(wed.value).toBe("7.5");
    fireEvent.change(wed, { target: { value: "7.5a" } });
    expect(wed.value).toBe("7.5");
    fireEvent.change(wed, { target: { value: "30" } });
    expect(wed.value).toBe("7.5");
    fireEvent.blur(wed);
    expect(wed.value).toBe("7.5");
  });

  it("closes the monthly inline input on Escape and returns focus to the day", async () => {
    renderTable(mockApi(), { defaultView: "monthly", initialMonth: "2026-09" });
    // From the 17th, only the Backstage contract covers the day.
    const day = await screen.findByRole("button", { name: /^Thu, Sep 17, 2026/ });
    fireEvent.click(day);
    const input = cell("Backstage", "Thu, Sep 17, 2026");
    expect(input).toHaveFocus();

    fireEvent.keyDown(input, { key: "Escape" });
    expect(screen.queryByLabelText("Hours for Backstage on Thu, Sep 17, 2026")).not.toBeInTheDocument();
    const again = screen.getByRole("button", { name: /^Thu, Sep 17, 2026/ });
    expect(again).toHaveAttribute("aria-pressed", "false");
    expect(again).toHaveFocus();
  });
});

describe("TimesheetTable time off", () => {
  it("lists time off with its dates written out", async () => {
    const api = mockApi({
      fetchExpectedHours: vi.fn(async () => ({
        expectedHours: 32,
        ptoHours: 8,
        timeOffs: [
          {
            id: "0b6f6c1e-4c1f-4f7e-9a51-2d0d7a3c9e10",
            type: "Vacation",
            startsAt: "2026-09-17T00:00:00.000Z",
            endsAt: "2026-09-18",
          },
        ],
      })),
    });
    renderTable(api);
    const row = (await screen.findByText("Vacation")).closest("tr")!;
    expect(within(row).getByText("Thu, Sep 17")).toBeInTheDocument();
    expect(within(row).getByText("Fri, Sep 18")).toBeInTheDocument();
  });
});

function timeOffApi(timeOffs: TimesheetTimeOff[]): TimesheetApi {
  return mockApi({ fetchExpectedHours: vi.fn(async () => ({ expectedHours: 24, ptoHours: 16, timeOffs })) });
}

/** Monday to Wednesday: `endsAt` is the Thursday the person is back. */
const VACATION: TimesheetTimeOff = {
  id: "0b6f6c1e-4c1f-4f7e-9a51-2d0d7a3c9e10",
  type: "Vacation",
  startsAt: "2026-09-14T00:00:00.000Z",
  endsAt: "2026-09-17T00:00:00.000Z",
};

const styleOf = (el: Element) => el.getAttribute("style") ?? "";
const category = (n: number) => `var(--color-category-${n})`;
const listSwatches = () =>
  screen
    .getAllByRole("row")
    .filter((row) => row.closest("table")?.querySelector("th")?.textContent === "Type")
    .slice(1)
    .map((row) => row.querySelector("span[aria-hidden]")!);

describe("TimesheetTable time-off colors", () => {
  it("gives each listed time off its own swatch, in list order", async () => {
    renderTable(timeOffApi([VACATION, { id: 9, type: "Sick", startsAt: "2026-09-18", endsAt: "2026-09-19" }]));
    await screen.findByText("Vacation");
    const swatches = listSwatches();
    expect(swatches).toHaveLength(2);
    expect(screen.getByText("Vacation")).toContainElement(swatches[0] as HTMLElement);
    expect(styleOf(swatches[0])).toContain(category(1));
    expect(styleOf(swatches[1])).toContain(category(2));
  });

  it("keeps eleven entries distinct and repeats from the twelfth", async () => {
    renderTable(
      timeOffApi(
        Array.from({ length: 12 }, (_, i) => ({
          id: i + 1,
          type: `Leave ${i + 1}`,
          startsAt: "2026-09-19",
          endsAt: "2026-09-20",
        })),
      ),
    );
    await screen.findByText("Leave 12");
    const colors = listSwatches().map(styleOf);
    expect(new Set(colors.slice(0, 11)).size).toBe(11);
    expect(colors[11]).toBe(colors[0]);
  });

  it("tints every contract's cells for the days off, endsAt excluded", async () => {
    renderTable(timeOffApi([VACATION]));
    await screen.findByText("Vacation");
    for (const day of ["Mon, Sep 14, 2026", "Tue, Sep 15, 2026", "Wed, Sep 16, 2026"]) {
      for (const project of ["Backstage", "Legacy"]) {
        const input = cell(project, day, "Vacation");
        expect(styleOf(input)).toContain(`color-mix(in srgb, ${category(1)} 20%, transparent)`);
        expect(styleOf(input)).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(/i);
      }
    }
    expect(styleOf(cell("Backstage", "Thu, Sep 17, 2026"))).toBe("");
    expect(styleOf(cell("Legacy", "Thu, Sep 17, 2026"))).toBe("");
    // The tint is the only difference: same classes as an untinted weekday.
    expect(cell("Backstage", "Mon, Sep 14, 2026", "Vacation").className).toBe(
      cell("Backstage", "Thu, Sep 17, 2026").className,
    );
    const grid = screen.getByText("Daily Total").closest("table")!;
    for (const part of [grid.querySelector("thead")!, grid.querySelector("tfoot")!]) {
      expect(part.innerHTML).not.toContain("--color-category");
    }
  });

  it("saves hours typed into a tinted cell like any other", async () => {
    const api = timeOffApi([VACATION]);
    renderTable(api);
    await screen.findByText("Vacation");
    fireEvent.change(cell("Backstage", "Tue, Sep 15, 2026", "Vacation"), { target: { value: "4" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Save" }));
    });
    expect(api.saveTimesheet).toHaveBeenCalledWith([{ contractId: 1, date: "2026-09-15", hours: 4 }]);
  });

  it("colors an overlapping day with the first listed entry", async () => {
    const sick = { id: 9, type: "Sick", startsAt: "2026-09-15", endsAt: "2026-09-16" };
    renderTable(timeOffApi([VACATION, sick]));
    await screen.findByText("Sick");
    const tue = cell("Backstage", "Tue, Sep 15, 2026", "Vacation");
    expect(styleOf(tue)).toContain(category(1));
    expect(styleOf(tue)).not.toContain(category(2));
    expect(listSwatches().map(styleOf)).toEqual([
      expect.stringContaining(category(1)),
      expect.stringContaining(category(2)),
    ]);
  });

  it("tints the month's days and the inline editor with the list's color, keeping the PTO badge", async () => {
    const sick = { id: 9, type: "Sick", startsAt: "2026-09-18", endsAt: "2026-09-19" };
    renderTable(timeOffApi([VACATION, sick]), { defaultView: "monthly", initialMonth: "2026-09" });
    await screen.findByText("Vacation");
    for (const name of [
      /^Mon, Sep 14, 2026, 6 hours, time off: Vacation$/,
      /^Tue, Sep 15, 2026, 2 hours, time off: Vacation$/,
      /^Wed, Sep 16, 2026, time off: Vacation$/,
    ]) {
      const day = screen.getByRole("button", { name });
      expect(styleOf(day)).toContain(category(1));
      expect(within(day).getByText("PTO")).toBeInTheDocument();
    }
    const thu = screen.getByRole("button", { name: /^Thu, Sep 17, 2026/ });
    expect(thu).not.toHaveAccessibleName(/time off/);
    expect(styleOf(thu)).toBe("");
    expect(styleOf(listSwatches()[0])).toContain(category(1));

    // From the 17th only Backstage covers the day, so Friday edits in place.
    fireEvent.click(screen.getByRole("button", { name: /^Fri, Sep 18, 2026, time off: Sick$/ }));
    const editor = screen.getByLabelText("Hours for Backstage on Fri, Sep 18, 2026").closest("div.ring-2")!;
    expect(styleOf(editor)).toContain(category(2));
    expect(styleOf(listSwatches()[1])).toContain(category(2));
  });

  it("tints nothing and lists nothing without time off", async () => {
    renderTable(timeOffApi([]));
    await screen.findByText("Daily Total");
    expect(document.body.innerHTML).not.toContain("--color-category");
    expect(screen.queryByText(/Time off this/)).not.toBeInTheDocument();
  });

  it("tints nothing in the month without time off", async () => {
    renderTable(timeOffApi([]), { defaultView: "monthly", initialMonth: "2026-09" });
    await screen.findByText("September 2026");
    await screen.findByRole("button", { name: /^Mon, Sep 14, 2026, 6 hours/ });
    expect(document.body.innerHTML).not.toContain("--color-category");
    expect(screen.queryByText(/Time off this/)).not.toBeInTheDocument();
  });

  it("keeps each entry's color across navigation and a remount", async () => {
    const api = timeOffApi([VACATION, { id: 9, type: "Sick", startsAt: "2026-09-18", endsAt: "2026-09-19" }]);
    const { unmount } = renderTable(api);
    await screen.findByText("Vacation");
    const before = listSwatches().map(styleOf);
    const monStyle = styleOf(cell("Backstage", "Mon, Sep 14, 2026", "Vacation"));

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Next week" }));
    });
    await screen.findByText("Sep 21 – Sep 27, 2026");
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Previous week" }));
    });
    await screen.findByText("Sep 14 – Sep 20, 2026");
    await screen.findByText("Vacation");
    expect(listSwatches().map(styleOf)).toEqual(before);
    expect(styleOf(cell("Backstage", "Mon, Sep 14, 2026", "Vacation"))).toBe(monStyle);

    unmount();
    renderTable(api);
    await screen.findByText("Vacation");
    expect(listSwatches().map(styleOf)).toEqual(before);
  });
});

describe("TimesheetTable holidays", () => {
  // After November 2026, so its weekdays without hours are in the past.
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 11, 1, 12));
  });
  afterEach(() => vi.useRealTimers());

  const HOLIDAYS: TimesheetHoliday[] = [
    { date: "2026-11-27", name: "QA Afternoon", part: "pm" },
    { date: "2026-11-25", name: "QA Full Holiday", part: "full" },
  ];

  const holidayApi = (extra: Record<string, unknown> = {}) =>
    mockApi({
      fetchTimeEntries: vi.fn(async () => ({ timeEntries: [] })),
      fetchExpectedHours: vi.fn(async () => ({
        expectedHours: 148,
        ptoHours: 8,
        timeOffs: [],
        holidays: HOLIDAYS,
        holidayHours: 12,
        ...extra,
      })),
    });

  it("shows the holiday hours before the time off in the summary", async () => {
    renderTable(holidayApi());
    await screen.findByText("Daily Total");
    const holiday = screen.getByText("12h holiday");
    const timeOff = screen.getByText("8h time off");
    expect(holiday.compareDocumentPosition(timeOff) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("shows the holiday hours before the time off when expected hours are unavailable", async () => {
    renderTable(holidayApi({ expectedHours: null }));
    await screen.findByText(/Expected hours unavailable/);
    const holiday = screen.getByText("12h holiday");
    const timeOff = screen.getByText("8h time off");
    expect(holiday.compareDocumentPosition(timeOff) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("shows no holiday badge or list when the response has none", async () => {
    renderTable(mockApi());
    await screen.findByText("Daily Total");
    expect(screen.queryByText(/h holiday$/)).not.toBeInTheDocument();
    expect(screen.queryByText(/^Holidays this/)).not.toBeInTheDocument();
  });

  it("shows no holiday badge or list for zero hours and an empty list", async () => {
    renderTable(holidayApi({ holidays: [], holidayHours: 0 }));
    await screen.findByText("Daily Total");
    expect(screen.queryByText(/h holiday$/)).not.toBeInTheDocument();
    expect(screen.queryByText(/^Holidays this/)).not.toBeInTheDocument();
  });

  it("lists the month's holidays by date, with the part of the day off", async () => {
    renderTable(holidayApi(), { defaultView: "monthly", initialMonth: "2026-11" });
    await screen.findByText("Holidays this month");
    const table = screen.getByRole("columnheader", { name: "Holiday" }).closest("table")!;
    const rows = within(table).getAllByRole("row").slice(1);
    expect(rows.map((r) => within(r).getAllByRole("cell").map((c) => c.textContent))).toEqual([
      ["Wed, Nov 25", "QA Full Holiday", "Full day"],
      ["Fri, Nov 27", "QA Afternoon", "Afternoon off"],
    ]);
  });

  it("titles the list for the week in the weekly view and keeps holiday cells editable", async () => {
    const api = holidayApi();
    renderTable(api, { initialWeek: "2026-11-23" });
    await screen.findByText("Holidays this week");

    const wed = cell("Backstage", "Wed, Nov 25, 2026", undefined, "QA Full Holiday");
    expect(wed).toBeEnabled();
    expect(wed.closest("td")).not.toHaveTextContent("Holiday");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    fireEvent.change(wed, { target: { value: "8" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Save" }));
    });
    expect(api.saveTimesheet).toHaveBeenCalledWith([{ contractId: 1, date: "2026-11-25", hours: 8 }]);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("marks holidays on the calendar and flags only an afternoon-off one without hours", async () => {
    renderTable(holidayApi(), { defaultView: "monthly", initialMonth: "2026-11" });

    const full = await screen.findByRole("button", { name: /^Wed, Nov 25, 2026/ });
    expect(full).toHaveAccessibleName("Wed, Nov 25, 2026, holiday: QA Full Holiday");
    expect(within(full).getByText("Holiday")).toBeInTheDocument();
    expect(within(full).queryByText("No hours")).not.toBeInTheDocument();
    expect(full).not.toHaveClass("bg-error-soft");

    const pm = screen.getByRole("button", { name: /^Fri, Nov 27, 2026/ });
    expect(pm).toHaveAccessibleName("Fri, Nov 27, 2026, holiday: QA Afternoon, afternoon off, no hours");
    expect(within(pm).getByText("Holiday")).toBeInTheDocument();
    expect(within(pm).getByText("No hours")).toBeInTheDocument();
    expect(pm).toHaveClass("bg-error-soft");

    // An ordinary past weekday without hours is still flagged.
    expect(screen.getByRole("button", { name: /^Thu, Nov 26, 2026/ })).toHaveAccessibleName(
      "Thu, Nov 26, 2026, no hours",
    );
  });

  it("shows both badges on a day with time off and a holiday", async () => {
    renderTable(
      holidayApi({ timeOffs: [{ id: 9, type: "Vacation", startsAt: "2026-11-25", endsAt: "2026-11-26" }] }),
      { defaultView: "monthly", initialMonth: "2026-11" },
    );
    const day = await screen.findByRole("button", { name: /^Wed, Nov 25, 2026/ });
    expect(day).toHaveAccessibleName("Wed, Nov 25, 2026, time off: Vacation, holiday: QA Full Holiday");
    expect(within(day).getByText("PTO")).toBeInTheDocument();
    expect(within(day).getByText("Holiday")).toBeInTheDocument();
  });
});

describe("TimesheetTable holiday colors", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 11, 1, 12));
  });
  afterEach(() => vi.useRealTimers());

  const HOLIDAY_TINT = "color-mix(in srgb, var(--color-warning) 20%, transparent)";
  const HOLIDAYS: TimesheetHoliday[] = [
    { date: "2026-11-25", name: "QA Full Holiday", part: "full" },
    { date: "2026-11-27", name: "QA Afternoon", part: "pm" },
  ];
  /** Tuesday to Friday: covers the full holiday and the afternoon off. */
  const VACATION: TimesheetTimeOff = { id: 9, type: "Vacation", startsAt: "2026-11-24", endsAt: "2026-11-28" };
  const colorsApi = (timeOffs: TimesheetTimeOff[] = []) =>
    mockApi({
      fetchTimeEntries: vi.fn(async () => ({ timeEntries: [] })),
      fetchExpectedHours: vi.fn(async () => ({
        expectedHours: 148,
        ptoHours: 0,
        timeOffs,
        holidays: HOLIDAYS,
        holidayHours: 12,
      })),
    });

  it("tints every contract's cells on a holiday, full day or afternoon off, and names it", async () => {
    renderTable(colorsApi(), { initialWeek: "2026-11-23" });
    await screen.findByText("Holidays this week");
    const full = cell("Backstage", "Wed, Nov 25, 2026", undefined, "QA Full Holiday");
    const pm = cell("Backstage", "Fri, Nov 27, 2026", undefined, "QA Afternoon, afternoon off");
    for (const input of [full, pm]) {
      expect(styleOf(input)).toContain(HOLIDAY_TINT);
      expect(styleOf(input)).not.toContain("--color-category");
      expect(input).toBeEnabled();
    }
    expect(styleOf(cell("Backstage", "Thu, Nov 26, 2026"))).toBe("");
    // The tint is the only difference: same classes as an untinted weekday.
    expect(full.className).toBe(cell("Backstage", "Thu, Nov 26, 2026").className);
  });

  it("puts an amber swatch before each holiday's name", async () => {
    renderTable(colorsApi(), { initialWeek: "2026-11-23" });
    await screen.findByText("Holidays this week");
    for (const name of ["QA Full Holiday", "QA Afternoon"]) {
      const swatch = screen.getByText(name).querySelector("span[aria-hidden]")!;
      expect(swatch).not.toBeNull();
      expect(styleOf(swatch)).toContain("var(--color-warning)");
    }
  });

  it("keeps the holiday color over time off, full day and afternoon off alike", async () => {
    renderTable(colorsApi([VACATION]), { initialWeek: "2026-11-23" });
    await screen.findByText("Holidays this week");
    const full = cell("Backstage", "Wed, Nov 25, 2026", "Vacation", "QA Full Holiday");
    expect(styleOf(full)).toContain(HOLIDAY_TINT);
    expect(styleOf(full)).not.toContain("--color-category");
    const pm = cell("Backstage", "Fri, Nov 27, 2026", "Vacation", "QA Afternoon, afternoon off");
    expect(styleOf(pm)).toContain(HOLIDAY_TINT);
    expect(styleOf(pm)).not.toContain("--color-category");
    expect(styleOf(cell("Backstage", "Tue, Nov 24, 2026", "Vacation"))).toContain(category(1));
  });

  it("tints the month's holidays and the inline editor with the same rule", async () => {
    renderTable(colorsApi([VACATION]), { defaultView: "monthly", initialMonth: "2026-11" });
    const full = await screen.findByRole("button", {
      name: "Wed, Nov 25, 2026, time off: Vacation, holiday: QA Full Holiday",
    });
    expect(styleOf(full)).toContain(HOLIDAY_TINT);
    const pm = screen.getByRole("button", {
      name: "Fri, Nov 27, 2026, time off: Vacation, holiday: QA Afternoon, afternoon off",
    });
    expect(styleOf(pm)).toContain(HOLIDAY_TINT);
    expect(styleOf(pm)).not.toContain("--color-category");

    // Only Backstage covers November, so the full holiday edits in place.
    fireEvent.click(full);
    const editor = screen.getByLabelText("Hours for Backstage on Wed, Nov 25, 2026").closest("div.ring-2")!;
    expect(styleOf(editor)).toContain(HOLIDAY_TINT);
  });

  it("tints an afternoon off without time off with the holiday color in the month", async () => {
    renderTable(colorsApi(), { defaultView: "monthly", initialMonth: "2026-11" });
    const pm = await screen.findByRole("button", { name: /^Fri, Nov 27, 2026, holiday: QA Afternoon/ });
    expect(styleOf(pm)).toContain(HOLIDAY_TINT);
    expect(styleOf(screen.getByRole("button", { name: /^Thu, Nov 26, 2026/ }))).toBe("");
  });
});

describe("TimesheetTable expected hours unavailable", () => {
  it("keeps the grid editable when expected hours come back null, with the caller's notice", async () => {
    const api = mockApi({
      fetchExpectedHours: vi.fn(async () => ({
        expectedHours: null,
        ptoHours: 0,
        timeOffs: [],
        notice: { variant: "error" as const, message: "Time off couldn't be loaded right now." },
      })),
    });
    renderTable(api);
    await screen.findByText("Daily Total");

    expect(screen.getByText(/Expected hours unavailable/)).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Time off couldn't be loaded right now.");
    // Nothing is worked out against a target it doesn't have.
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(screen.queryByText(/remaining|over|Complete/)).not.toBeInTheDocument();

    fireEvent.change(cell("Backstage", "Wed, Sep 16, 2026"), { target: { value: "4" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Save" }));
    });
    expect(api.saveTimesheet).toHaveBeenCalledWith([{ contractId: 1, date: "2026-09-16", hours: 4 }]);
  });

  it("treats a failed expected-hours call as unavailable instead of a failed load", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const api = mockApi({ fetchExpectedHours: vi.fn().mockRejectedValue(new Error("503")) });
    renderTable(api);
    await screen.findByText("Daily Total");

    expect(screen.queryByText("Failed to load time entries")).not.toBeInTheDocument();
    expect(screen.getByText(/Expected hours unavailable/)).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Expected hours couldn't be loaded. You can still log your hours.",
    );
    expect(cell("Backstage", "Mon, Sep 14, 2026")).toBeEnabled();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });

  it("shows a notice alongside known expected hours", async () => {
    const api = mockApi({
      fetchExpectedHours: vi.fn(async () => ({
        expectedHours: 40,
        ptoHours: 0,
        timeOffs: [],
        notice: { variant: "warning" as const, message: "Your time off isn't subtracted." },
      })),
    });
    renderTable(api);
    await screen.findByText("Daily Total");

    expect(screen.getByText("Your time off isn't subtracted.").closest('[role="status"]')).toBeInTheDocument();
    expect(screen.getByText("32h remaining")).toBeInTheDocument();
    expect(screen.queryByText(/Expected hours unavailable/)).not.toBeInTheDocument();
  });

  it("clears the notice when the next period loads normally", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchExpectedHours = vi
      .fn()
      .mockRejectedValueOnce(new Error("503"))
      .mockResolvedValue({ expectedHours: 40, ptoHours: 0, timeOffs: [] });
    renderTable(mockApi({ fetchExpectedHours }));
    await screen.findByRole("alert");

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Next week" }));
    });
    await screen.findByText("Sep 21 – Sep 27, 2026");
    await screen.findByText("40h remaining");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

describe("createDefaultApi", () => {
  it("posts changed entries and surfaces the server's error", async () => {
    const fetchMock = vi.fn(
      async () => new Response(JSON.stringify({ error: "Locked period" }), { status: 400 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    try {
      const api = createDefaultApi("", { "X-Test": "1" });
      const entries = [{ contractId: 1, date: "2026-09-14", hours: 8 }];
      await expect(api.saveTimesheet(entries)).rejects.toThrow("Locked period");
      const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
      expect(url).toBe("/api/my-timesheets/save");
      expect(init.method).toBe("POST");
      expect(init.headers).toEqual({ "X-Test": "1", "Content-Type": "application/json" });
      expect(JSON.parse(init.body as string)).toEqual({ entries });
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
