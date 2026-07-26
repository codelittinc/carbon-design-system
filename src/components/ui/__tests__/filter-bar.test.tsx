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
});
