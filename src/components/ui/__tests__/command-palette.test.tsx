import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { CommandGroup, CommandItem, CommandPalette } from "../command-palette";

const INPUT_PLACEHOLDER = "Search or type a command...";

describe("CommandPalette", () => {
  it("renders nothing when open is false", () => {
    const { container } = render(
      <CommandPalette open={false} onOpenChange={() => {}}>
        <CommandItem onSelect={() => {}}>Do thing</CommandItem>
      </CommandPalette>,
    );
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByPlaceholderText(INPUT_PLACEHOLDER)).not.toBeInTheDocument();
  });

  it("renders the search input and children when open is true", () => {
    render(
      <CommandPalette open onOpenChange={() => {}}>
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => {}}>Do thing</CommandItem>
        </CommandGroup>
      </CommandPalette>,
    );
    expect(screen.getByPlaceholderText(INPUT_PLACEHOLDER)).toBeInTheDocument();
    expect(screen.getByText("Do thing")).toBeInTheDocument();
    expect(screen.getByText("Actions")).toBeInTheDocument();
  });

  it("calls onOpenChange(false) when the overlay is clicked", () => {
    const onOpenChange = vi.fn();
    const { container } = render(
      <CommandPalette open onOpenChange={onOpenChange}>
        <CommandItem onSelect={() => {}}>Do thing</CommandItem>
      </CommandPalette>,
    );
    const overlay = container.querySelector('[class*="bg-black"]');
    expect(overlay).not.toBeNull();
    fireEvent.click(overlay!);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("toggles open via Cmd/Ctrl+K", () => {
    const onOpenChange = vi.fn();
    render(
      <CommandPalette open={false} onOpenChange={onOpenChange}>
        <CommandItem onSelect={() => {}}>Do thing</CommandItem>
      </CommandPalette>,
    );
    fireEvent.keyDown(document, { key: "k", metaKey: true });
    expect(onOpenChange).toHaveBeenCalledWith(true);

    onOpenChange.mockClear();
    fireEvent.keyDown(document, { key: "k", ctrlKey: true });
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("triggers a CommandItem's onSelect when the item is clicked", () => {
    const onSelect = vi.fn();
    // Drive open state so the toggle from Cmd+K would be observable too, but here
    // we simply verify the item's onSelect wiring.
    function Wrapper() {
      const [open, setOpen] = useState(true);
      return (
        <CommandPalette open={open} onOpenChange={setOpen}>
          <CommandItem onSelect={onSelect}>Run report</CommandItem>
        </CommandPalette>
      );
    }
    render(<Wrapper />);
    fireEvent.click(screen.getByText("Run report"));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});
