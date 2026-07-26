import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SearchSelect } from "../search-select";

interface Option {
  value: string;
  label: string;
  sublabel?: string;
}

const OPTIONS: Option[] = [
  { value: "a", label: "Apple", sublabel: "fruit" },
  { value: "b", label: "Banana" },
];

function Harness(props: {
  options?: Option[];
  onChange?: (value: string | null) => void;
  onSearch?: (q: string) => void;
  loading?: boolean;
  clearable?: boolean;
  autoFocus?: boolean;
  initialValue?: string | null;
  renderOption?: (o: Option) => React.ReactNode;
  triggerClassName?: string;
  contentClassName?: string;
  optionClassName?: string;
}) {
  const [value, setValue] = useState<string | null>(props.initialValue ?? null);
  return (
    <SearchSelect
      value={value}
      onChange={(v) => {
        setValue(v);
        props.onChange?.(v);
      }}
      onSearch={props.onSearch ?? (() => {})}
      options={props.options ?? OPTIONS}
      loading={props.loading}
      clearable={props.clearable}
      autoFocus={props.autoFocus}
      renderOption={props.renderOption}
      triggerClassName={props.triggerClassName}
      contentClassName={props.contentClassName}
      optionClassName={props.optionClassName}
    />
  );
}

// The trigger is a plain button with aria-haspopup="listbox" (role="combobox"
// is reserved for the search input), so identify it by that attribute — it's
// stable across open/closed and selected/empty states.
const getTrigger = () =>
  document.querySelector('[aria-haspopup="listbox"]') as HTMLElement;

describe("SearchSelect", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("opens the dropdown on trigger click and shows the search input", () => {
    render(<Harness />);
    expect(screen.queryByPlaceholderText("Search...")).not.toBeInTheDocument();
    fireEvent.click(getTrigger());
    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
  });

  it("fires onSearch debounced 300ms after typing", () => {
    const onSearch = vi.fn();
    render(<Harness onSearch={onSearch} />);
    fireEvent.click(getTrigger());
    fireEvent.change(screen.getByPlaceholderText("Search..."), {
      target: { value: "app" },
    });
    expect(onSearch).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(onSearch).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith("app");
  });

  it("selects an option, calls onChange(value), and closes the dropdown", () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    fireEvent.click(getTrigger());
    fireEvent.click(screen.getByText("Banana"));
    expect(onChange).toHaveBeenCalledWith("b");
    expect(screen.queryByPlaceholderText("Search...")).not.toBeInTheDocument();
  });

  it("clear button calls onChange(null)", () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} initialValue="a" />);
    // The trigger shows the selected label; the clear affordance is a role=button.
    const clear = screen.getAllByRole("button").find((el) => el.getAttribute("tabindex") === "-1");
    expect(clear).toBeDefined();
    fireEvent.click(clear!);
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("opens on mount when autoFocus is set", () => {
    render(<Harness autoFocus />);
    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
  });

  it("shows 'Searching...' while loading", () => {
    render(<Harness loading autoFocus />);
    expect(screen.getByText("Searching...")).toBeInTheDocument();
  });

  it("shows 'No results' when there are no options", () => {
    render(<Harness options={[]} autoFocus />);
    expect(screen.getByText("No results")).toBeInTheDocument();
  });

  it("uses renderOption for custom option rendering", () => {
    render(
      <Harness autoFocus renderOption={(o) => <span>custom-{o.label}</span>} />,
    );
    expect(screen.getByText("custom-Apple")).toBeInTheDocument();
    expect(screen.getByText("custom-Banana")).toBeInTheDocument();
  });

  describe("keyboard navigation", () => {
    it("ArrowDown on the closed trigger opens the list", () => {
      render(<Harness />);
      expect(screen.queryByPlaceholderText("Search...")).not.toBeInTheDocument();
      fireEvent.keyDown(getTrigger(), { key: "ArrowDown" });
      expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
    });

    it("opening with ArrowDown activates the first option, so Enter selects it", () => {
      const onChange = vi.fn();
      render(<Harness onChange={onChange} />);
      fireEvent.keyDown(getTrigger(), { key: "ArrowDown" });
      // No second arrow press: the first option is already active on open.
      fireEvent.keyDown(screen.getByPlaceholderText("Search..."), { key: "Enter" });
      expect(onChange).toHaveBeenCalledWith("a");
    });

    it("opening with ArrowUp activates the last option", () => {
      const onChange = vi.fn();
      render(<Harness onChange={onChange} />);
      fireEvent.keyDown(getTrigger(), { key: "ArrowUp" });
      fireEvent.keyDown(screen.getByPlaceholderText("Search..."), { key: "Enter" });
      expect(onChange).toHaveBeenCalledWith("b");
    });

    it("ArrowDown moves the active option and wires aria-activedescendant", () => {
      render(<Harness autoFocus />);
      const input = screen.getByPlaceholderText("Search...");
      expect(input).not.toHaveAttribute("aria-activedescendant");

      fireEvent.keyDown(input, { key: "ArrowDown" });
      const apple = screen.getByRole("option", { name: /Apple/ });
      expect(input).toHaveAttribute("aria-activedescendant", apple.id);

      fireEvent.keyDown(input, { key: "ArrowDown" });
      const banana = screen.getByRole("option", { name: /Banana/ });
      expect(input).toHaveAttribute("aria-activedescendant", banana.id);
    });

    it("ArrowDown wraps from the last option back to the first", () => {
      render(<Harness autoFocus />);
      const input = screen.getByPlaceholderText("Search...");
      fireEvent.keyDown(input, { key: "ArrowDown" }); // Apple
      fireEvent.keyDown(input, { key: "ArrowDown" }); // Banana
      fireEvent.keyDown(input, { key: "ArrowDown" }); // wraps to Apple
      const apple = screen.getByRole("option", { name: /Apple/ });
      expect(input).toHaveAttribute("aria-activedescendant", apple.id);
    });

    it("ArrowUp from no active option wraps to the last option", () => {
      render(<Harness autoFocus />);
      const input = screen.getByPlaceholderText("Search...");
      fireEvent.keyDown(input, { key: "ArrowUp" });
      const banana = screen.getByRole("option", { name: /Banana/ });
      expect(input).toHaveAttribute("aria-activedescendant", banana.id);
    });

    it("Enter selects the active option and closes the list", () => {
      const onChange = vi.fn();
      render(<Harness autoFocus onChange={onChange} />);
      const input = screen.getByPlaceholderText("Search...");
      fireEvent.keyDown(input, { key: "ArrowDown" }); // Apple
      fireEvent.keyDown(input, { key: "ArrowDown" }); // Banana
      fireEvent.keyDown(input, { key: "Enter" });
      expect(onChange).toHaveBeenCalledWith("b");
      expect(screen.queryByPlaceholderText("Search...")).not.toBeInTheDocument();
    });

    it("Enter with no active option does not select", () => {
      const onChange = vi.fn();
      render(<Harness autoFocus onChange={onChange} />);
      fireEvent.keyDown(screen.getByPlaceholderText("Search..."), { key: "Enter" });
      expect(onChange).not.toHaveBeenCalled();
      expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
    });

    it("Escape closes the list and returns focus to the trigger", () => {
      render(<Harness autoFocus />);
      fireEvent.keyDown(screen.getByPlaceholderText("Search..."), { key: "Escape" });
      expect(screen.queryByPlaceholderText("Search...")).not.toBeInTheDocument();
      expect(getTrigger()).toHaveFocus();
    });

    it("selecting an option returns focus to the trigger", () => {
      render(<Harness autoFocus />);
      fireEvent.click(screen.getByText("Banana"));
      expect(getTrigger()).toHaveFocus();
    });

    it("keeps options out of the Tab sequence (active-descendant pattern)", () => {
      render(<Harness autoFocus />);
      screen
        .getAllByRole("option")
        .forEach((o) => expect(o).toHaveAttribute("tabindex", "-1"));
    });

    it("closes when focus leaves the widget (e.g. Tab away)", () => {
      render(
        <>
          <Harness autoFocus />
          <button type="button">outside</button>
        </>,
      );
      expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
      // Tab moves focus to a focusable element outside the widget.
      fireEvent.focusOut(screen.getByPlaceholderText("Search..."), {
        relatedTarget: screen.getByText("outside"),
      });
      expect(screen.queryByPlaceholderText("Search...")).not.toBeInTheDocument();
    });

    it("stays open when focus moves within the widget", () => {
      render(<Harness autoFocus />);
      const input = screen.getByPlaceholderText("Search...");
      // relatedTarget inside the widget (e.g. an option gaining focus on click).
      fireEvent.focusOut(input, {
        relatedTarget: screen.getByRole("option", { name: /Apple/ }),
      });
      expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
    });

    it("closes when focus leaves with no relatedTarget (focus to browser chrome)", () => {
      render(<Harness autoFocus />);
      const input = screen.getByPlaceholderText("Search...");
      // Focus genuinely leaves the widget (activeElement -> body) with no
      // relatedTarget, as when focus moves to browser chrome or is cleared.
      input.blur();
      fireEvent.focusOut(input, { relatedTarget: null });
      expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
      act(() => {
        vi.advanceTimersByTime(0);
      });
      expect(screen.queryByPlaceholderText("Search...")).not.toBeInTheDocument();
    });

    it("stays open when focus is cleared but lands back inside the widget", () => {
      render(<Harness autoFocus />);
      const input = screen.getByPlaceholderText("Search...");
      // No relatedTarget, but focus is inside the widget when the deferred check runs.
      input.focus();
      fireEvent.focusOut(input, { relatedTarget: null });
      act(() => {
        vi.advanceTimersByTime(0);
      });
      expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
    });

    it("marks the selected option with aria-selected", () => {
      render(<Harness autoFocus initialValue="a" />);
      expect(screen.getByRole("option", { name: /Apple/ })).toHaveAttribute(
        "aria-selected",
        "true",
      );
      expect(screen.getByRole("option", { name: /Banana/ })).toHaveAttribute(
        "aria-selected",
        "false",
      );
    });

    it("exposes the trigger as aria-haspopup=listbox with aria-expanded, and the input as the combobox", () => {
      render(<Harness />);
      const trigger = getTrigger();
      expect(trigger).toHaveAttribute("aria-haspopup", "listbox");
      expect(trigger).toHaveAttribute("aria-expanded", "false");
      // Only the input carries role=combobox — not the trigger — so a screen
      // reader sees a single combobox for the widget.
      expect(screen.queryByRole("combobox")).not.toBeInTheDocument();

      fireEvent.click(trigger);
      expect(trigger).toHaveAttribute("aria-expanded", "true");
      const combobox = screen.getByRole("combobox");
      expect(combobox).toBe(screen.getByPlaceholderText("Search..."));
      expect(combobox).toHaveAttribute("aria-controls");
    });
  });

  describe("style overrides", () => {
    it("merges triggerClassName onto the trigger", () => {
      render(<Harness triggerClassName="custom-trigger" />);
      expect(getTrigger()).toHaveClass("custom-trigger");
    });

    it("merges contentClassName onto the dropdown panel", () => {
      render(<Harness autoFocus contentClassName="custom-content" />);
      expect(document.querySelector(".custom-content")).toBeInTheDocument();
    });

    it("merges optionClassName onto each option", () => {
      render(<Harness autoFocus optionClassName="custom-option" />);
      const options = screen.getAllByRole("option");
      expect(options).toHaveLength(2);
      options.forEach((o) => expect(o).toHaveClass("custom-option"));
    });
  });
});
