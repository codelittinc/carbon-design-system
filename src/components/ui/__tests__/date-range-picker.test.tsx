import { fireEvent, render, screen } from "@testing-library/react";
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

function pick(trigger: string, option: string) {
  fireEvent.click(screen.getByRole("combobox", { name: trigger }));
  fireEvent.click(screen.getByRole("option", { name: option }));
}

describe("DateRangePicker", () => {
  it("renders four labelled design-system selects showing the current range", () => {
    render(<Harness />);
    expect(screen.getAllByRole("combobox")).toHaveLength(4);
    expect(screen.getByRole("combobox", { name: "Start month" })).toHaveTextContent("Jan");
    expect(screen.getByRole("combobox", { name: "Start year" })).toHaveTextContent("2024");
    expect(screen.getByRole("combobox", { name: "End month" })).toHaveTextContent("Dec");
    expect(screen.getByRole("combobox", { name: "End year" })).toHaveTextContent("2024");
    // No native <select> left behind.
    expect(document.querySelector("select")).toBeNull();
  });

  it("offers 12 month options and one option per year", () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole("combobox", { name: "Start month" }));
    expect(screen.getAllByRole("option")).toHaveLength(12);
    fireEvent.keyDown(document.activeElement!, { key: "Escape" });

    fireEvent.click(screen.getByRole("combobox", { name: "Start year" }));
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["2023", "2024", "2025"]);
  });

  it("changing the start month calls onChange with the merged range", () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    pick("Start month", "Mar");
    expect(onChange).toHaveBeenCalledWith({ ...INITIAL, startMonth: 3 });
  });

  it("changing the end year calls onChange with the merged range, as a number", () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    pick("End year", "2025");
    expect(onChange).toHaveBeenCalledWith({ ...INITIAL, endYear: 2025 });
  });

  it("reflects controlled value updates in the triggers", () => {
    render(<Harness />);
    pick("Start year", "2023");
    expect(screen.getByRole("combobox", { name: "Start year" })).toHaveTextContent("2023");
  });
});
