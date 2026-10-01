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
  screen.getByRole("spinbutton", { name: `Hours for ${project} on ${day}` }) as HTMLInputElement;

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
