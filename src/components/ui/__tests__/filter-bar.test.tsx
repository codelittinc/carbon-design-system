import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FilterBar } from "../filter-bar";

describe("FilterBar", () => {
  it("renders the search input only when onSearchChange is provided", () => {
    const { rerender } = render(<FilterBar />);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();

    rerender(<FilterBar onSearchChange={() => {}} />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("fires onSearchChange with the typed value", async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    render(<FilterBar onSearchChange={onSearchChange} />);
    await user.type(screen.getByRole("textbox"), "a");
    expect(onSearchChange).toHaveBeenCalledWith("a");
  });

  it("uses the searchPlaceholder", () => {
    render(<FilterBar onSearchChange={() => {}} searchPlaceholder="Find users" />);
    expect(screen.getByPlaceholderText("Find users")).toBeInTheDocument();
  });

  it("names the search input after the placeholder by default", () => {
    render(<FilterBar onSearchChange={() => {}} searchPlaceholder="Find users" />);
    expect(screen.getByRole("textbox", { name: "Find users" })).toBeInTheDocument();
  });

  it("names the search input with searchLabel when given", () => {
    render(
      <FilterBar
        onSearchChange={() => {}}
        searchPlaceholder="Name or email"
        searchLabel="Search employees"
      />,
    );
    const input = screen.getByRole("textbox", { name: "Search employees" });
    expect(input).toHaveAttribute("placeholder", "Name or email");
  });

  it("names the search input with the default placeholder when neither is given", () => {
    render(<FilterBar onSearchChange={() => {}} />);
    expect(screen.getByRole("textbox", { name: "Search..." })).toBeInTheDocument();
  });

  it("renders children in the filter slot", () => {
    render(
      <FilterBar>
        <button>Status</button>
      </FilterBar>,
    );
    expect(screen.getByRole("button", { name: "Status" })).toBeInTheDocument();
  });

  it("reflects the controlled search value", () => {
    render(<FilterBar search="query" onSearchChange={() => {}} />);
    expect(screen.getByRole("textbox")).toHaveValue("query");
  });

  it("hides the search icon from screen readers", () => {
    const { container } = render(<FilterBar onSearchChange={() => {}} />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("forwards a ref to the search input through searchInputProps", () => {
    const ref = createRef<HTMLInputElement>();
    render(<FilterBar onSearchChange={() => {}} searchInputProps={{ ref }} />);
    expect(ref.current).toBe(screen.getByRole("textbox"));
  });

  it("passes onKeyDown through searchInputProps", async () => {
    const user = userEvent.setup();
    const onKeyDown = vi.fn();
    render(<FilterBar onSearchChange={() => {}} searchInputProps={{ onKeyDown }} />);
    await user.type(screen.getByRole("textbox"), "{Escape}");
    expect(onKeyDown).toHaveBeenCalledWith(expect.objectContaining({ key: "Escape" }));
  });

  it("applies searchInputProps without losing value, onChange or the name", async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    render(
      <FilterBar
        search="sl"
        onSearchChange={onSearchChange}
        searchLabel="Filter your tools"
        searchInputProps={{ type: "search", autoComplete: "off", className: "h-11 sm:h-9" }}
      />,
    );
    const input = screen.getByRole("searchbox", { name: "Filter your tools" });
    expect(input).toHaveValue("sl");
    expect(input).toHaveAttribute("type", "search");
    expect(input).toHaveAttribute("autocomplete", "off");
    expect(input).toHaveClass("pl-9", "h-11", "sm:h-9");
    expect(input).not.toHaveClass("h-8");
    await user.type(input, "a");
    expect(onSearchChange).toHaveBeenCalledWith("sla");
  });

  it("lets className replace the wrapper's bottom margin", () => {
    const { container } = render(<FilterBar className="mb-0" />);
    expect(container.firstElementChild).toHaveClass("mb-0");
    expect(container.firstElementChild).not.toHaveClass("mb-4");
  });

  it("stacks below sm and keeps today's row from sm up by default", () => {
    const { container } = render(<FilterBar onSearchChange={() => {}} />);
    const bar = container.firstElementChild;
    expect(bar).toHaveClass("mb-4", "flex", "flex-col", "items-stretch", "gap-2");
    expect(bar).toHaveClass("sm:flex-row", "sm:flex-wrap", "sm:items-center", "sm:gap-3");
    const searchBox = screen.getByRole("textbox").parentElement;
    expect(searchBox).toHaveClass("relative", "w-full", "sm:w-auto", "sm:max-w-sm", "sm:flex-1");
    expect(searchBox).not.toHaveClass("max-w-sm");
    expect(searchBox).not.toHaveClass("flex-1");
  });

  it("keeps the single row at every width when stackOnMobile is false", () => {
    const { container } = render(<FilterBar onSearchChange={() => {}} stackOnMobile={false} />);
    const bar = container.firstElementChild;
    expect(bar).toHaveClass("mb-4", "flex", "items-center", "gap-3");
    expect(bar).not.toHaveClass("flex-col");
    expect(bar).not.toHaveClass("sm:flex-row");
    expect(bar).not.toHaveClass("sm:flex-wrap");
    const searchBox = screen.getByRole("textbox").parentElement;
    expect(searchBox).toHaveClass("relative", "max-w-sm", "flex-1");
    expect(searchBox).not.toHaveClass("w-full");
  });

  it("keeps the default input height unless size is touch", () => {
    render(<FilterBar onSearchChange={() => {}} />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("h-8", "pl-9");
    expect(input).not.toHaveClass("h-11");
  });

  it("makes the search input 44px below sm and the default height from sm with size touch", () => {
    render(<FilterBar onSearchChange={() => {}} size="touch" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("h-11", "sm:h-8", "pl-9");
    expect(input).not.toHaveClass("h-8");
  });

  it("lets searchInputProps.className override the touch height", () => {
    render(
      <FilterBar
        onSearchChange={() => {}}
        size="touch"
        searchInputProps={{ className: "h-12 sm:h-9" }}
      />,
    );
    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("h-12", "sm:h-9");
    expect(input).not.toHaveClass("h-11");
    expect(input).not.toHaveClass("sm:h-8");
  });

  it("centres the search icon vertically on the input at either size", () => {
    const { container } = render(<FilterBar onSearchChange={() => {}} size="touch" />);
    expect(container.querySelector("svg")).toHaveClass("absolute", "top-1/2", "-translate-y-1/2");
  });
});
