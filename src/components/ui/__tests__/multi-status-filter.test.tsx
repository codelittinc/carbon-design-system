import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { MultiStatusFilter, type StatusOption } from "../multi-status-filter";

const OPTIONS: StatusOption[] = [
  { value: "open", label: "Open" },
  { value: "closed", label: "Closed" },
  { value: "pending", label: "Pending" },
  { value: "archived", label: "Archived" },
];

function Harness({
  initial = [],
  onChange,
}: {
  initial?: string[];
  onChange?: (next: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>(initial);
  return (
    <MultiStatusFilter
      options={OPTIONS}
      selected={selected}
      onChange={(next) => {
        onChange?.(next);
        setSelected(next);
      }}
    />
  );
}

function trigger() {
  return screen.getByRole("button", { name: "Status filter" });
}

describe("MultiStatusFilter summary", () => {
  it("shows 'All statuses' when nothing is selected", () => {
    render(<Harness initial={[]} />);
    expect(trigger()).toHaveTextContent("All statuses");
  });

  it("shows 'All statuses' when everything is selected", () => {
    render(<Harness initial={OPTIONS.map((o) => o.value)} />);
    expect(trigger()).toHaveTextContent("All statuses");
  });

  it("joins labels when 2 or fewer are selected", () => {
    render(<Harness initial={["open", "closed"]} />);
    expect(trigger()).toHaveTextContent("Open, Closed");
  });

  it("shows 'N selected' when more than 2 are selected", () => {
    render(<Harness initial={["open", "closed", "pending"]} />);
    expect(trigger()).toHaveTextContent("3 selected");
  });

  it("shows the count pill when a partial selection is active", () => {
    const { unmount } = render(<Harness initial={["open"]} />);
    expect(trigger()).toHaveTextContent(/1/);
    unmount();
  });

  it("hides the count pill when nothing is selected", () => {
    const { unmount } = render(<Harness initial={[]} />);
    expect(trigger()).not.toHaveTextContent(/\d/);
    unmount();
  });

  it("hides the count pill when everything is selected", () => {
    render(<Harness initial={OPTIONS.map((o) => o.value)} />);
    expect(trigger()).not.toHaveTextContent(/\d/);
  });
});

describe("MultiStatusFilter options", () => {
  it("renders options as checkboxes reflecting selection via aria-checked", async () => {
    const user = userEvent.setup();
    render(<Harness initial={["open"]} />);

    await user.click(trigger());
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(OPTIONS.length);
    expect(
      screen.getByRole("checkbox", { name: "Open" }),
    ).toHaveAttribute("aria-checked", "true");
    expect(
      screen.getByRole("checkbox", { name: "Closed" }),
    ).toHaveAttribute("aria-checked", "false");
  });

  it("adds a value when clicking an unchecked option", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness initial={["open"]} onChange={onChange} />);

    await user.click(trigger());
    await user.click(screen.getByRole("checkbox", { name: "Closed" }));
    expect(onChange).toHaveBeenCalledWith(["open", "closed"]);
  });

  it("removes a value when clicking a checked option", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness initial={["open", "closed"]} onChange={onChange} />);

    await user.click(trigger());
    await user.click(screen.getByRole("checkbox", { name: "Open" }));
    expect(onChange).toHaveBeenCalledWith(["closed"]);
  });
});

describe("MultiStatusFilter All / Clear", () => {
  it("'All' selects every value and is disabled once all are selected", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness initial={["open"]} onChange={onChange} />);

    await user.click(trigger());
    await user.click(screen.getByRole("button", { name: "All" }));
    expect(onChange).toHaveBeenCalledWith(OPTIONS.map((o) => o.value));
    expect(screen.getByRole("button", { name: "All" })).toBeDisabled();
  });

  it("'Clear' empties the selection and is disabled when none selected", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness initial={["open", "closed"]} onChange={onChange} />);

    await user.click(trigger());
    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(onChange).toHaveBeenCalledWith([]);
    expect(screen.getByRole("button", { name: "Clear" })).toBeDisabled();
  });
});
