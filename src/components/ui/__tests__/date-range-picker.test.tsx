import { fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { DateRangePicker, type MonthYearRange } from "../date-range-picker";

const YEARS = [2023, 2024, 2025];
const INITIAL: MonthYearRange = {
  startMonth: 1,
  startYear: 2024,
  endMonth: 12,
  endYear: 2024,
};

function Harness(props: { onChange?: (v: MonthYearRange) => void }) {
  const [value, setValue] = useState<MonthYearRange>(INITIAL);
  return (
    <DateRangePicker
      value={value}
      years={YEARS}
      onChange={(v) => {
        setValue(v);
        props.onChange?.(v);
      }}
    />
  );
}

describe("DateRangePicker", () => {
  it("renders four selects with 12 month options and one option per year", () => {
    render(<Harness />);
    const selects = screen.getAllByRole("combobox");
    expect(selects).toHaveLength(4);

    const [startMonth, startYear] = selects;
    expect(within(startMonth).getAllByRole("option")).toHaveLength(12);
    expect(within(startYear).getAllByRole("option")).toHaveLength(YEARS.length);
    expect(within(startMonth).getByRole("option", { name: "Jan" })).toBeInTheDocument();
    expect(within(startYear).getByRole("option", { name: "2025" })).toBeInTheDocument();
  });

  it("changing the start month calls onChange with the merged range", () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    const [startMonth] = screen.getAllByRole("combobox");
    fireEvent.change(startMonth, { target: { value: "3" } });
    expect(onChange).toHaveBeenCalledWith({ ...INITIAL, startMonth: 3 });
  });

  it("changing the end year calls onChange with the merged range", () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    const endYear = screen.getAllByRole("combobox")[3];
    fireEvent.change(endYear, { target: { value: "2025" } });
    expect(onChange).toHaveBeenCalledWith({ ...INITIAL, endYear: 2025 });
  });

  it("reflects controlled value updates in the selects", () => {
    render(<Harness />);
    const selects = screen.getAllByRole("combobox") as HTMLSelectElement[];
    expect(selects[1].value).toBe("2024");
    fireEvent.change(selects[1], { target: { value: "2023" } });
    expect(selects[1].value).toBe("2023");
  });
});
