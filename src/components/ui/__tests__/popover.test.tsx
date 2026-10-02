import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";

function PopoverExample({ defaultOpen }: { defaultOpen?: boolean }) {
  return (
    <Popover defaultOpen={defaultOpen}>
      <PopoverTrigger>Open popover</PopoverTrigger>
      <PopoverContent className="custom-popover-content">
        Popover panel content
      </PopoverContent>
    </Popover>
  );
}

describe("Popover", () => {
  it("shows content only after the trigger is clicked", () => {
    render(<PopoverExample />);

    expect(screen.queryByText("Popover panel content")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Open popover" }));

    expect(screen.getByText("Popover panel content")).toBeInTheDocument();
  });

  it("forwards className to the content when open", () => {
    render(<PopoverExample defaultOpen />);

    expect(screen.getByText("Popover panel content")).toHaveClass("custom-popover-content");
  });

  it("closes when the trigger is toggled again", () => {
    render(<PopoverExample />);
    const trigger = screen.getByRole("button", { name: "Open popover" });

    fireEvent.click(trigger);
    expect(screen.getByText("Popover panel content")).toBeInTheDocument();
    fireEvent.click(trigger);
    expect(screen.queryByText("Popover panel content")).not.toBeInTheDocument();
  });
});
