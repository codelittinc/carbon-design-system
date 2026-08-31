import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { MonthCalendar } from "./month-calendar";
import { Button } from "./button";
import { shiftMonth, todayIn, type YearMonth } from "@/lib/calendar";

/**
 * MonthCalendar picks ONE day. It is the day-level counterpart to
 * `DateRangePicker`, which selects a range of months and is a different control.
 *
 * Controlled in both dimensions — the month on screen and the day chosen —
 * because the two move independently: paging to December does not unpick the
 * 3rd of September.
 */
const meta: Meta<typeof MonthCalendar> = {
  title: "Components/Forms/MonthCalendar",
  component: MonthCalendar,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof MonthCalendar>;

const today = todayIn();
const thisMonth: YearMonth = { year: today.year, month: today.month };

/** Every day pickable — what an ordinary date field wants. */
export const Default: Story = {
  render: () => {
    const [month, setMonth] = useState(thisMonth);
    const [day, setDay] = useState<string | null>(null);
    return (
      <div className="space-y-3">
        <MonthCalendar
          month={month}
          onMonthChange={setMonth}
          selected={day}
          onSelect={(key) => setDay(key === day ? null : key)}
          min={shiftMonth(thisMonth, -12)}
          max={shiftMonth(thisMonth, 12)}
          aria-label="Pick a day"
        />
        <p className="text-xs text-text-muted">{day ?? "nothing picked"}</p>
      </div>
    );
  },
};

/**
 * With an `available` set, everything outside it is disabled rather than absent
 * — the month keeps its shape, so the reader can see the pattern of what is on
 * offer instead of a grid with holes punched in it.
 */
export const OnlySomeDays: Story = {
  render: () => {
    const [month, setMonth] = useState(thisMonth);
    const [day, setDay] = useState<string | null>(null);
    // Weekdays of the current month, as a host's published hours might be.
    const available = new Set(
      Array.from({ length: 31 }, (_, i) => i + 1)
        .map((d) => `${month.year}-${String(month.month).padStart(2, "0")}-${String(d).padStart(2, "0")}`)
        .filter((_, i) => i % 7 < 5),
    );
    return (
      <MonthCalendar
        month={month}
        onMonthChange={setMonth}
        selected={day}
        onSelect={setDay}
        available={available}
        min={shiftMonth(thisMonth, -1)}
        max={shiftMonth(thisMonth, 3)}
        aria-label="Pick a day"
      />
    );
  },
};

/**
 * Inside a form, which is where the type of every button matters: `Button`
 * renders a bare `<button>` and sets no default type, so an unmarked one submits.
 * Every button in the calendar is `type="button"` — clicking a day, or paging
 * the month, must never submit the form around it.
 */
export const InsideAForm: Story = {
  render: () => {
    const [month, setMonth] = useState(thisMonth);
    const [day, setDay] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState<string | null>(null);
    return (
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(day ?? "(no day)");
        }}
      >
        <MonthCalendar
          month={month}
          onMonthChange={setMonth}
          selected={day}
          onSelect={setDay}
          min={shiftMonth(thisMonth, -12)}
          max={shiftMonth(thisMonth, 12)}
          aria-label="Last working day"
        />
        <input type="hidden" name="day" value={day ?? ""} />
        <Button type="submit">Save</Button>
        <p className="text-xs text-text-muted">
          {submitted ? `submitted: ${submitted}` : "not submitted — only Save does that"}
        </p>
      </form>
    );
  },
};
