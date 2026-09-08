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

  // jsdom does no layout, so overflow itself cannot be measured here. What CAN break — and is
  // what these cover — is the fix silently disappearing: `[&>span]:truncate` lives on the
  // trigger (the variant selects the span in CSS, it does not move the class onto it), which
  // puts it in reach of `cn`'s tailwind-merge on every consumer that passes a className.
  describe("a value longer than the trigger", () => {
    it("clips the value rather than letting it push the chevron out", () => {
      renderSelect({ defaultValue: "apple" });
      const trigger = screen.getByRole("combobox", { name: "Fruit" });
      expect(trigger).toHaveClass("min-w-0", "[&>span]:min-w-0", "[&>span]:truncate");
    });

    it("keeps the chevron at its own size", () => {
      renderSelect();
      const chevron = screen.getByRole("combobox", { name: "Fruit" }).querySelector("svg");
      expect(chevron).toHaveClass("shrink-0");
    });

    it("survives a consumer's own width class", () => {
      renderSelect({ triggerClassName: "w-40" });
      const trigger = screen.getByRole("combobox", { name: "Fruit" });
      expect(trigger).toHaveClass("w-40", "[&>span]:min-w-0", "[&>span]:truncate");
      // w-full is the one that must lose — a consumer asking for w-40 means w-40.
      expect(trigger).not.toHaveClass("w-full");
    });
  });
});
