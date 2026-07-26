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
    />
  );
}

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
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
  });

  it("fires onSearch debounced 300ms after typing", () => {
    const onSearch = vi.fn();
    render(<Harness onSearch={onSearch} />);
    fireEvent.click(screen.getByRole("button"));
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
    fireEvent.click(screen.getByRole("button"));
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
});
