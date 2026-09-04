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
    render(
      <CommandPalette open onOpenChange={onOpenChange}>
        <CommandItem onSelect={() => {}}>Do thing</CommandItem>
      </CommandPalette>,
    );
    // `document.body`, not the render container: the palette is portalled there
    // so that a filtered ancestor cannot size it. See the portal test below.
    const overlay = document.body.querySelector('[class*="bg-black"]');
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

  it("renders into document.body, so a filtered ancestor cannot size it", () => {
    // A `backdrop-filter` on any ancestor makes that ancestor the containing
    // block for `fixed` descendants, which silently sizes the palette to the
    // header instead of the viewport. Portalling is what prevents it.
    const { container } = render(
      <div style={{ backdropFilter: "blur(12px)" }}>
        <CommandPalette open onOpenChange={() => {}}>
          <CommandItem onSelect={() => {}}>Do thing</CommandItem>
        </CommandPalette>
      </div>,
    );
    expect(container.querySelector('[cmdk-root]')).toBeNull();
    expect(document.body.querySelector("[cmdk-root]")).not.toBeNull();
  });

  it("focuses the input on open, so the first keystroke is not lost", () => {
    render(
      <CommandPalette open onOpenChange={() => {}}>
        <CommandItem onSelect={() => {}}>Do thing</CommandItem>
      </CommandPalette>,
    );
    expect(screen.getByPlaceholderText(INPUT_PLACEHOLDER)).toHaveFocus();
  });

  it("closes on Escape, and does not let the press travel further", () => {
    const onOpenChange = vi.fn();
    const outer = vi.fn();
    render(
      <div onKeyDown={outer}>
        <CommandPalette open onOpenChange={onOpenChange}>
          <CommandItem onSelect={() => {}}>Do thing</CommandItem>
        </CommandPalette>
      </div>,
    );
    fireEvent.keyDown(screen.getByPlaceholderText(INPUT_PLACEHOLDER), { key: "Escape" });
    expect(onOpenChange).toHaveBeenCalledWith(false);
    // The palette is portalled, so `outer` is not an ancestor in the DOM — the
    // assertion that matters is that nothing else was asked to close too.
    expect(outer).not.toHaveBeenCalled();
  });

  it("takes a controlled query, so the consumer can render only what it shows", () => {
    const onValueChange = vi.fn();
    render(
      <CommandPalette open onOpenChange={() => {}} value="mont" onValueChange={onValueChange}>
        <CommandItem onSelect={() => {}}>Montie Dietrich</CommandItem>
      </CommandPalette>,
    );
    const input = screen.getByPlaceholderText(INPUT_PLACEHOLDER);
    expect(input).toHaveValue("mont");

    fireEvent.change(input, { target: { value: "monti" } });
    expect(onValueChange).toHaveBeenCalledWith("monti");
  });

  it("shouldFilter={false} keeps every row rendered, in the order given", () => {
    /*
     * The reason this prop exists. With cmdk filtering, a row that does not match
     * renders as `null`, and cmdk reads a row's value from its DOM node — so a
     * row first mounted while a search is active has nothing to read and stays
     * invisible for the life of the palette. With filtering off the consumer has
     * already narrowed, and every row it passes is drawn.
     */
    render(
      <CommandPalette open onOpenChange={() => {}} value="zzzz-matches-nothing" shouldFilter={false}>
        <CommandItem onSelect={() => {}}>Montie Dietrich</CommandItem>
        <CommandItem onSelect={() => {}}>Jose Garcia</CommandItem>
      </CommandPalette>,
    );
    expect(screen.getByText("Montie Dietrich")).toBeInTheDocument();
    expect(screen.getByText("Jose Garcia")).toBeInTheDocument();
    expect(screen.queryByText("No results found.")).not.toBeInTheDocument();
  });

  it("gives two identically-worded rows distinct identities via value", () => {
    // cmdk keys selection on the value, not the element, so without this two
    // employees with the same name are both highlighted and only the first can
    // be reached or opened.
    render(
      <CommandPalette open onOpenChange={() => {}} shouldFilter={false}>
        <CommandItem onSelect={() => {}} value="person-1">
          Jose Garcia
        </CommandItem>
        <CommandItem onSelect={() => {}} value="person-2">
          Jose Garcia
        </CommandItem>
      </CommandPalette>,
    );
    const values = [...document.querySelectorAll("[cmdk-item]")].map((el) =>
      el.getAttribute("data-value"),
    );
    expect(values).toEqual(["person-1", "person-2"]);
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
