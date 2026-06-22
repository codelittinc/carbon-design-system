import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { DateRangePicker, type MonthYearRange } from "./date-range-picker";

/**
 * DateRangePicker selects a start and end month/year, used for report periods.
 * Controlled via a MonthYearRange value.
 */
const meta: Meta<typeof DateRangePicker> = {
  title: "Components/Forms/DateRangePicker",
  component: DateRangePicker,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof DateRangePicker>;

export const Default: Story = {
  render: () => {
    const [range, setRange] = useState<MonthYearRange>({
      startMonth: 1,
      startYear: 2025,
      endMonth: 12,
      endYear: 2025,
    });
    return <DateRangePicker value={range} onChange={setRange} years={[2023, 2024, 2025]} />;
  },
};
