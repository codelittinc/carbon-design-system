import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { MultiSelect, type MultiSelectOption } from "../multi-select";

const OPTIONS: MultiSelectOption[] = [
  { value: "ana", label: "Ana" },
  { value: "bruno", label: "Bruno" },
  { value: "carla", label: "Carla", disabled: true },
];

function Harness({ onChange }: { onChange?: (v: string[]) => void }) {
  const [value, setValue] = useState<string[]>([]);
  return (
    <MultiSelect
      ariaLabel="People"
      value={value}
      options={OPTIONS}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
    />
  );
}

describe("MultiSelect", () => {
  it("opens on focus and lists the options", () => {
    render(<Harness />);
    const input = screen.getByRole("combobox", { name: "People" });
    expect(input).toHaveAttribute("aria-expanded", "false");
    fireEvent.focus(input);
    expect(input).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("filters by the search text", () => {
    render(<Harness />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "br" } });
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["Bruno"]);
  });

  it("shows the empty message when nothing matches", () => {
    render(<Harness />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "zzz" } });
    expect(screen.getByText("No matches")).toBeInTheDocument();
  });

  it("toggles values and stays open", () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    fireEvent.focus(screen.getByRole("combobox"));
    fireEvent.mouseDown(screen.getByRole("option", { name: "Ana" }));
    fireEvent.mouseDown(screen.getByRole("option", { name: "Bruno" }));
    expect(screen.getByRole("option", { name: "Ana" })).toHaveAttribute("aria-selected", "true");
    fireEvent.mouseDown(screen.getByRole("option", { name: "Ana" }));
    expect(onChange.mock.calls).toEqual([[["ana"]], [["ana", "bruno"]], [["bruno"]]]);
  });

  it("ignores disabled options", () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    fireEvent.focus(screen.getByRole("combobox"));
    fireEvent.mouseDown(screen.getByRole("option", { name: "Carla" }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("picks with the keyboard and removes the last value with Backspace", () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.keyDown(input, { key: "Backspace" });
    expect(onChange.mock.calls).toEqual([[["ana"]], [[]]]);
  });

  it("closes on Escape", () => {
    render(<Harness />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: "Escape" });
    expect(input).toHaveAttribute("aria-expanded", "false");
  });
});

describe("MultiSelect create and server search", () => {
  const optionTexts = () => screen.getAllByRole("option").map((o) => o.textContent);

  it("offers to create the search when no label matches it exactly", async () => {
    const onCreate = vi.fn();
    render(
      <MultiSelect ariaLabel="Tags" value={[]} onChange={() => {}} options={OPTIONS} onCreate={onCreate} />,
    );
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "  Dora " } });
    expect(optionTexts()).toEqual(['Create "Dora"']);

    await act(async () => {
      fireEvent.mouseDown(screen.getByRole("option", { name: 'Create "Dora"' }));
    });
    expect(onCreate).toHaveBeenCalledWith("Dora");
    // The search clears, and the list stays open for the next pick.
    expect(input).toHaveValue("");
    expect(input).toHaveAttribute("aria-expanded", "true");
  });

  it("hides the create option on an exact match, ignoring case", () => {
    render(
      <MultiSelect ariaLabel="Tags" value={[]} onChange={() => {}} options={OPTIONS} onCreate={() => {}} />,
    );
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "bruno" } });
    expect(optionTexts()).toEqual(["Bruno"]);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "bru" } });
    expect(optionTexts()).toEqual(["Bruno", 'Create "bru"']);
  });

  it("reaches the create option from the keyboard, with a custom label", async () => {
    const onCreate = vi.fn(async () => {});
    render(
      <MultiSelect
        ariaLabel="Tags"
        value={[]}
        onChange={() => {}}
        options={OPTIONS}
        onCreate={onCreate}
        createLabel={(input) => `Add tag ${input}`}
      />,
    );
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "an" } });
    expect(optionTexts()).toEqual(["Ana", "Add tag an"]);
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    await act(async () => {
      fireEvent.keyDown(input, { key: "Enter" });
    });
    expect(onCreate).toHaveBeenCalledWith("an");
  });

  it("leaves filtering to the caller with onSearchChange", () => {
    const onSearchChange = vi.fn();
    const { rerender } = render(
      <MultiSelect
        ariaLabel="People"
        value={[]}
        onChange={() => {}}
        options={OPTIONS}
        onSearchChange={onSearchChange}
        loading
      />,
    );
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "zz" } });
    expect(onSearchChange).toHaveBeenLastCalledWith("zz");
    // Not filtered locally: the server decides what matches.
    expect(optionTexts()).toEqual(["Ana", "Bruno", "Carla"]);

    rerender(
      <MultiSelect
        ariaLabel="People"
        value={[]}
        onChange={() => {}}
        options={[]}
        onSearchChange={onSearchChange}
        loading
      />,
    );
    expect(screen.getByText("Loading…")).toBeInTheDocument();
    expect(screen.getByRole("listbox")).toHaveAttribute("aria-busy", "true");

    // Closing clears the search, and says so.
    fireEvent.keyDown(input, { key: "Escape" });
    expect(onSearchChange).toHaveBeenLastCalledWith("");
  });
});

describe("MultiSelect onCreate while pending", () => {
  it("creates once for a double Enter or double press, and disables the row meanwhile", async () => {
    let resolve!: () => void;
    const onCreate = vi.fn(() => new Promise<void>((r) => (resolve = r)));
    render(<MultiSelect ariaLabel="Tags" value={[]} onChange={() => {}} options={OPTIONS} onCreate={onCreate} />);
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "Dora" } });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.keyDown(input, { key: "Enter" });
    const row = screen.getByRole("option", { name: 'Create "Dora"' });
    fireEvent.mouseDown(row);
    expect(onCreate).toHaveBeenCalledOnce();
    expect(row).toHaveAttribute("aria-disabled", "true");

    await act(async () => resolve());
    expect(input).toHaveValue("");
  });

  it("swallows a rejected create and keeps the search for another try", async () => {
    const onCreate = vi.fn().mockRejectedValueOnce(new Error("taken")).mockResolvedValue(undefined);
    render(<MultiSelect ariaLabel="Tags" value={[]} onChange={() => {}} options={OPTIONS} onCreate={onCreate} />);
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "Dora" } });
    await act(async () => {
      fireEvent.mouseDown(screen.getByRole("option", { name: 'Create "Dora"' }));
    });
    expect(input).toHaveValue("Dora");
    await act(async () => {
      fireEvent.mouseDown(screen.getByRole("option", { name: 'Create "Dora"' }));
    });
    expect(onCreate).toHaveBeenCalledTimes(2);
    expect(input).toHaveValue("");
  });
});
