import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { DayRangePicker, type DayRange } from "./day-range-picker";
import { Button } from "./button";
import { dateKey, shiftMonth, todayIn, type YearMonth } from "@/lib/calendar";

/**
 * DayRangePicker picks a range of DAYS: click the first, then the last. It is
 * `MonthCalendar` for a range, and not `DateRangePicker`, which selects months.
 *
 * Paging keeps the first day, so a range can cross months. While only the first
 * day is picked, hovering a later one previews the range.
 */
const meta: Meta<typeof DayRangePicker> = {
  title: "Components/Forms/DayRangePicker",
  component: DayRangePicker,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof DayRangePicker>;

const today = todayIn();
const thisMonth: YearMonth = { year: today.year, month: today.month };

function Picker(props: Partial<React.ComponentProps<typeof DayRangePicker>>) {
  const [month, setMonth] = useState(thisMonth);
  const [range, setRange] = useState<DayRange>({ start: null, end: null });
  return (
    <div className="space-y-3">
      <DayRangePicker
        month={month}
        onMonthChange={setMonth}
        value={range}
        onChange={setRange}
        min={shiftMonth(thisMonth, -12)}
        max={shiftMonth(thisMonth, 12)}
        {...props}
      />
      <p className="text-sm text-text-secondary">
        {range.start ? `${range.start} → ${range.end ?? "…"}` : "Nothing picked"}
      </p>
      <Button type="button" variant="outline" size="sm" onClick={() => setRange({ start: null, end: null })}>
        Clear
      </Button>
    </div>
  );
}

/** Every day pickable. */
export const Default: Story = { render: () => <Picker /> };

/**
 * Time off: nothing in the past, and the days a request doesn't cost — weekends
 * and company holidays — drawn faint and named. They stay pickable: a week off
 * runs over its weekend.
 */
export const TimeOff: Story = {
  render: () => {
    const holiday = dateKey({ ...thisMonth, day: 26 });
    return (
      <Picker
        firstDay={dateKey(today)}
        unavailableLabel="in the past"
        muteWeekends
        muted={{ [holiday]: "Company holiday" }}
      />
    );
  },
};
