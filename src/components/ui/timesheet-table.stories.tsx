import type { Meta, StoryObj } from "@storybook/react";
import { TimesheetTable, type TimesheetApi, type TimesheetContract } from "./timesheet-table";
import { ToastProvider } from "./toast";

/**
 * TimesheetTable edits a person's hours per contract per day, weekly or
 * monthly. These stories run on a mock `api` with a little latency; edits
 * "save" after 15 seconds, or straight away with Save.
 */
const meta: Meta<typeof TimesheetTable> = {
  title: "Components/Data Display/TimesheetTable",
  component: TimesheetTable,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof TimesheetTable>;

const today = new Date();
const year = today.getUTCFullYear();
const month = today.getUTCMonth();
const iso = (d: Date) => d.toISOString().slice(0, 10);
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const CONTRACTS: TimesheetContract[] = [
  {
    id: 1,
    name: "Development Contract",
    projectName: "Backstage Platform",
    customerName: "Codelitt",
    startDate: new Date(Date.UTC(year, 0, 1)).toISOString(),
    endDate: new Date(Date.UTC(year, 11, 31)).toISOString(),
    projectActive: true,
  },
  {
    id: 2,
    name: "Consulting Contract",
    projectName: "Mobile App Redesign",
    customerName: "Acme Corp",
    startDate: new Date(Date.UTC(year, month - 1, 1)).toISOString(),
    endDate: new Date(Date.UTC(year, month + 3, 0)).toISOString(),
    projectActive: true,
  },
  {
    id: 3,
    name: "Support Contract",
    projectName: "Legacy System",
    customerName: "Globex Inc",
    startDate: new Date(Date.UTC(year, 0, 1)).toISOString(),
    endDate: new Date(Date.UTC(year, 11, 31)).toISOString(),
    projectActive: true,
  },
];

/** Six hours on contract 1 and two on contract 2, every weekday. */
function weekdayEntries(startDate: string, endDate: string) {
  const entries = [];
  let id = 1;
  for (let d = new Date(startDate + "T00:00:00Z"); iso(d) <= endDate; d.setUTCDate(d.getUTCDate() + 1)) {
    const dow = d.getUTCDay();
    if (dow === 0 || dow === 6) continue;
    entries.push({ id: id++, date: d.toISOString(), hours: 6, userId: 1, contractId: 1 });
    entries.push({ id: id++, date: d.toISOString(), hours: 2, userId: 1, contractId: 2 });
  }
  return entries;
}

const mockApi: TimesheetApi = {
  async fetchTimeEntries({ startDate, endDate }) {
    await delay(500);
    return { timeEntries: weekdayEntries(startDate, endDate) };
  },
  async fetchExpectedHours() {
    await delay(300);
    return { expectedHours: 40, ptoHours: 0, timeOffs: [] };
  },
  async saveTimesheet(entries) {
    await delay(800);
    return {
      success: true,
      upserted: entries.filter((e) => e.hours !== null).length,
      deleted: entries.filter((e) => e.hours === null).length,
    };
  },
};

const emptyApi: TimesheetApi = {
  ...mockApi,
  async fetchTimeEntries() {
    await delay(300);
    return { timeEntries: [] };
  },
};

function mondayOf(date: Date): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay();
  d.setUTCDate(d.getUTCDate() - day + (day === 0 ? -6 : 1));
  return d;
}

const withTimeOffApi: TimesheetApi = {
  ...mockApi,
  async fetchExpectedHours() {
    await delay(300);
    const wed = mondayOf(today);
    wed.setUTCDate(wed.getUTCDate() + 2);
    const thu = new Date(wed);
    thu.setUTCDate(wed.getUTCDate() + 1);
    return {
      expectedHours: 32,
      ptoHours: 8,
      timeOffs: [{ id: 1, type: "Vacation", startsAt: iso(wed), endsAt: iso(thu) }],
    };
  },
};

const failingApi: TimesheetApi = {
  ...mockApi,
  async fetchTimeEntries() {
    await delay(300);
    throw new Error("Network error");
  },
};

const base = { userId: 1, userFullName: "Jane Smith", contracts: CONTRACTS, api: mockApi };

export const WeeklyView: Story = { args: { ...base, defaultView: "weekly" } };

export const MonthlyView: Story = { args: { ...base, defaultView: "monthly" } };

export const WithTimeOff: Story = { args: { ...base, api: withTimeOffApi } };

export const EmptyTimesheet: Story = { args: { ...base, api: emptyApi } };

export const SingleContract: Story = { args: { ...base, contracts: [CONTRACTS[0]] } };

export const NoContracts: Story = { args: { ...base, contracts: [], api: emptyApi } };

export const LoadError: Story = { args: { ...base, api: failingApi } };

export const CustomTitle: Story = { args: { ...base, title: "Timesheet — This Week" } };
