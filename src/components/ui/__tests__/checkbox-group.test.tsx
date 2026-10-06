import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { CheckboxGroup, type CheckboxGroupOption } from "../checkbox-group";

const OPTIONS: CheckboxGroupOption[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "archived", label: "Archived", disabled: true },
];

function Harness({ initial = [], onChange }: { initial?: string[]; onChange?: (v: string[]) => void }) {
  const [value, setValue] = useState(initial);
  return (
    <form data-testid="form">
      <CheckboxGroup
        aria-label="Status"
        name="status"
        options={OPTIONS}
        value={value}
        onChange={(v) => {
          setValue(v);
          onChange?.(v);
        }}
      />
    </form>
  );
}

describe("CheckboxGroup", () => {
  it("is a group of checkboxes named by their labels", () => {
    render(<Harness initial={["inactive"]} />);
    expect(screen.getByRole("group", { name: "Status" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Active" })).toHaveAttribute("aria-checked", "false");
    expect(screen.getByRole("checkbox", { name: "Inactive" })).toHaveAttribute("aria-checked", "true");
  });

  it("adds and removes values, and toggles from the label", () => {
    const onChange = vi.fn();
    render(<Harness initial={["inactive"]} onChange={onChange} />);
    fireEvent.click(screen.getByText("Active"));
    expect(onChange).toHaveBeenLastCalledWith(["inactive", "active"]);
    fireEvent.click(screen.getByRole("checkbox", { name: "Inactive" }));
    expect(onChange).toHaveBeenLastCalledWith(["active"]);
  });

  it("disables one option, or all of them", () => {
    const { unmount } = render(<Harness />);
    expect(screen.getByRole("checkbox", { name: "Archived" })).toBeDisabled();
    expect(screen.getByRole("checkbox", { name: "Active" })).toBeEnabled();
    unmount();

    render(<CheckboxGroup options={OPTIONS} value={[]} onChange={() => {}} disabled />);
    screen.getAllByRole("checkbox").forEach((c) => expect(c).toBeDisabled());
  });

  it("submits each checked value under its name", () => {
    render(<Harness initial={["active", "inactive"]} />);
    const data = new FormData(screen.getByTestId("form") as HTMLFormElement);
    expect(data.getAll("status")).toEqual(["active", "inactive"]);
  });

  it("lays out vertically", () => {
    render(<CheckboxGroup options={OPTIONS} value={[]} onChange={() => {}} orientation="vertical" />);
    expect(screen.getByRole("group")).toHaveClass("flex-col");
  });
});
