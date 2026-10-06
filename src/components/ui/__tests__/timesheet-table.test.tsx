import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  TimesheetTable,
  createDefaultApi,
  type TimesheetApi,
  type TimesheetContract,
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

const cell = (project: string, day: string) =>
  screen.getByLabelText(`Hours for ${project} on ${day}`) as HTMLInputElement;

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
    fireEvent.click(monday);
    expect(screen.getByRole("heading", { name: "Monday, Sep 14, 2026" })).toBeInTheDocument();
    expect(cell("Legacy", "Mon, Sep 14, 2026")).toBeEnabled();
  });

  it("pages to the next week", async () => {
    const api = mockApi();
    renderTable(api);
    await screen.findByText("Daily Total");

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Next" }));
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
      () => screen.getByRole("button", { name: "Next" }),
      () => screen.getByRole("button", { name: "Prev" }),
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
      fireEvent.click(screen.getByRole("button", { name: "Next" }));
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
        timeOffs: [{ id: 1, type: "Vacation", startsAt: "2026-09-17T00:00:00.000Z", endsAt: "2026-09-18" }],
      })),
    });
    renderTable(api);
    const row = (await screen.findByText("Vacation")).closest("tr")!;
    expect(within(row).getByText("Thu, Sep 17")).toBeInTheDocument();
    expect(within(row).getByText("Fri, Sep 18")).toBeInTheDocument();
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
