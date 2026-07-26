import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select";

function renderSelect(
  props: {
    onValueChange?: (value: string) => void;
    defaultValue?: string;
    value?: string;
    disabled?: boolean;
    triggerClassName?: string;
  } = {},
) {
  const { onValueChange, defaultValue, value, disabled, triggerClassName } = props;
  return render(
    <Select
      onValueChange={onValueChange}
      defaultValue={defaultValue}
      value={value}
    >
      <SelectTrigger className={triggerClassName} disabled={disabled} aria-label="Fruit">
        <SelectValue placeholder="Pick a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
      </SelectContent>
    </Select>,
  );
}

describe("Select", () => {
  it("renders the trigger with combobox role", () => {
    renderSelect();
    expect(screen.getByRole("combobox", { name: "Fruit" })).toBeInTheDocument();
  });

  it("shows the placeholder when nothing is selected", () => {
    renderSelect();
    expect(screen.getByText("Pick a fruit")).toBeInTheDocument();
  });

  it("opens and shows options when the trigger is clicked", () => {
    renderSelect();
    fireEvent.click(screen.getByRole("combobox", { name: "Fruit" }));
    expect(screen.getByRole("option", { name: "Apple" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Banana" })).toBeInTheDocument();
  });

  it("calls onValueChange with the chosen value and updates the displayed value", () => {
    const onValueChange = vi.fn();
    renderSelect({ onValueChange });
    fireEvent.click(screen.getByRole("combobox", { name: "Fruit" }));
    fireEvent.click(screen.getByRole("option", { name: "Banana" }));
    expect(onValueChange).toHaveBeenCalledWith("banana");
    expect(screen.getByRole("combobox", { name: "Fruit" })).toHaveTextContent("Banana");
  });

  it("renders the selected value from defaultValue", () => {
    renderSelect({ defaultValue: "apple" });
    expect(screen.getByRole("combobox", { name: "Fruit" })).toHaveTextContent("Apple");
  });

  it("disables the trigger", () => {
    renderSelect({ disabled: true });
    expect(screen.getByRole("combobox", { name: "Fruit" })).toBeDisabled();
  });

  it("forwards className to the trigger", () => {
    renderSelect({ triggerClassName: "custom-trigger" });
    expect(screen.getByRole("combobox", { name: "Fruit" })).toHaveClass("custom-trigger");
  });
});
