import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../sheet";

function SheetExample({ side }: { side?: "left" | "right" }) {
  return (
    <Sheet>
      <SheetTrigger>Open sheet</SheetTrigger>
      <SheetContent side={side} className="custom-sheet-content">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <SheetBody>Choose your filters here.</SheetBody>
        <SheetFooter>
          <SheetClose>Apply</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

describe("Sheet", () => {
  it("opens on trigger click rendering title and body content", () => {
    render(<SheetExample />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Open sheet" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Filters")).toBeInTheDocument();
    expect(screen.getByText("Choose your filters here.")).toBeInTheDocument();
  });

  it("forwards className to the content", () => {
    render(<SheetExample />);
    fireEvent.click(screen.getByRole("button", { name: "Open sheet" }));

    expect(screen.getByRole("dialog")).toHaveClass("custom-sheet-content");
  });

  it("applies the right-side variant classes by default", () => {
    render(<SheetExample />);
    fireEvent.click(screen.getByRole("button", { name: "Open sheet" }));

    expect(screen.getByRole("dialog")).toHaveClass("right-0");
  });

  it("applies the left-side variant classes when side=left", () => {
    render(<SheetExample side="left" />);
    fireEvent.click(screen.getByRole("button", { name: "Open sheet" }));

    expect(screen.getByRole("dialog")).toHaveClass("left-0");
  });

  it("closes via a SheetClose child", () => {
    render(<SheetExample />);
    fireEvent.click(screen.getByRole("button", { name: "Open sheet" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes via the built-in icon close button", () => {
    render(<SheetExample />);
    fireEvent.click(screen.getByRole("button", { name: "Open sheet" }));
    const dialog = screen.getByRole("dialog");

    const iconClose = dialog.querySelector("button > svg")?.closest("button");
    expect(iconClose).not.toBeNull();
    fireEvent.click(iconClose as HTMLButtonElement);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
