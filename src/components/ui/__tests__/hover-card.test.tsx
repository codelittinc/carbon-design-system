import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Button } from "../button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../hover-card";

function Example() {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button type="button">Chip</Button>
      </HoverCardTrigger>
      <HoverCardContent aria-label="Chip details">Chip details</HoverCardContent>
    </HoverCard>
  );
}

const hover = (el: Element) => fireEvent.pointerEnter(el, { pointerType: "mouse" });
const leave = (el: Element) => fireEvent.pointerLeave(el, { pointerType: "mouse" });
const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms));

describe("HoverCard", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("opens after the hover delay and closes when the pointer leaves", () => {
    render(<Example />);
    const trigger = screen.getByRole("button", { name: "Chip" });

    hover(trigger);
    advance(100);
    expect(screen.queryByText("Chip details")).not.toBeInTheDocument();
    advance(60);
    expect(screen.getByText("Chip details")).toBeInTheDocument();

    leave(trigger);
    advance(130);
    expect(screen.queryByText("Chip details")).not.toBeInTheDocument();
  });

  it("stays open while the pointer is on the content", () => {
    render(<Example />);
    const trigger = screen.getByRole("button", { name: "Chip" });
    hover(trigger);
    advance(150);
    leave(trigger);
    hover(screen.getByText("Chip details"));
    advance(500);
    expect(screen.getByText("Chip details")).toBeInTheDocument();
  });

  it("opens on keyboard focus", () => {
    render(<Example />);
    fireEvent.focus(screen.getByRole("button", { name: "Chip" }));
    advance(150);
    expect(screen.getByText("Chip details")).toBeInTheDocument();
  });

  it("pins on click, so leaving does not close it, and a second click does", () => {
    render(<Example />);
    const trigger = screen.getByRole("button", { name: "Chip" });

    hover(trigger);
    advance(150);
    fireEvent.click(trigger);
    leave(trigger);
    advance(500);
    expect(screen.getByText("Chip details")).toBeInTheDocument();

    fireEvent.click(trigger);
    expect(screen.queryByText("Chip details")).not.toBeInTheDocument();
  });

  it("unpins from a real press on the trigger, which Radix also sees as outside the card", () => {
    render(<Example />);
    const trigger = screen.getByRole("button", { name: "Chip" });
    fireEvent.click(trigger);
    advance(0);
    fireEvent.pointerDown(trigger);
    fireEvent.click(trigger);
    expect(screen.queryByText("Chip details")).not.toBeInTheDocument();
  });

  it("opens from a click alone, which is how a touch screen reaches it", () => {
    render(<Example />);
    fireEvent.click(screen.getByRole("button", { name: "Chip" }));
    expect(screen.getByText("Chip details")).toBeInTheDocument();
  });

  it("closes a pinned card on Escape", () => {
    render(<Example />);
    fireEvent.click(screen.getByRole("button", { name: "Chip" }));
    fireEvent.keyDown(document.body, { key: "Escape" });
    expect(screen.queryByText("Chip details")).not.toBeInTheDocument();
  });

  it("closes a pinned card on a press outside it", () => {
    render(
      <>
        <Example />
        <p>Elsewhere</p>
      </>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Chip" }));
    // Radix starts listening for outside presses a tick after opening.
    advance(0);
    fireEvent.pointerDown(screen.getByText("Elsewhere"));
    expect(screen.queryByText("Chip details")).not.toBeInTheDocument();
  });
});
