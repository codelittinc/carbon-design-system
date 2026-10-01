import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

describe("Popover openOnHover", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  function HoverExample({ label = "Chip" }: { label?: string }) {
    return (
      <Popover openOnHover>
        <PopoverTrigger>{label}</PopoverTrigger>
        <PopoverContent aria-label={`${label} details`}>{label} details</PopoverContent>
      </Popover>
    );
  }

  const hover = (el: Element) => fireEvent.pointerEnter(el, { pointerType: "mouse" });
  const leave = (el: Element) => fireEvent.pointerLeave(el, { pointerType: "mouse" });
  const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms));

  it("opens after the hover delay and closes when the pointer leaves", () => {
    render(<HoverExample />);
    const trigger = screen.getByRole("button", { name: "Chip" });

    hover(trigger);
    advance(100);
    expect(screen.queryByText("Chip details")).not.toBeInTheDocument();
    advance(60);
    expect(screen.getByText("Chip details")).toBeInTheDocument();
    // A preview does not take focus.
    expect(trigger).not.toHaveFocus();

    leave(trigger);
    advance(130);
    expect(screen.queryByText("Chip details")).not.toBeInTheDocument();
  });

  it("stays open while the pointer is on the content", () => {
    render(<HoverExample />);
    const trigger = screen.getByRole("button", { name: "Chip" });
    hover(trigger);
    advance(150);
    leave(trigger);
    hover(screen.getByText("Chip details"));
    advance(500);
    expect(screen.getByText("Chip details")).toBeInTheDocument();
  });

  it("pins on click, so leaving does not close it, and a second click does", () => {
    render(<HoverExample />);
    const trigger = screen.getByRole("button", { name: "Chip" });

    hover(trigger);
    advance(150);
    // The click that lands on an open preview pins it rather than toggling it shut.
    fireEvent.click(trigger);
    leave(trigger);
    advance(500);
    expect(screen.getByText("Chip details")).toBeInTheDocument();

    fireEvent.click(trigger);
    expect(screen.queryByText("Chip details")).not.toBeInTheDocument();
  });

  it("does not hover-open another popover while one is pinned", () => {
    render(
      <>
        <HoverExample label="First" />
        <HoverExample label="Second" />
      </>,
    );
    fireEvent.click(screen.getByRole("button", { name: "First" }));
    expect(screen.getByText("First details")).toBeInTheDocument();

    hover(screen.getByRole("button", { name: "Second" }));
    advance(500);
    expect(screen.queryByText("Second details")).not.toBeInTheDocument();
  });

  it("closes a pinned popover on Escape", () => {
    render(<HoverExample />);
    fireEvent.click(screen.getByRole("button", { name: "Chip" }));
    fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" });
    expect(screen.queryByText("Chip details")).not.toBeInTheDocument();
  });
});
