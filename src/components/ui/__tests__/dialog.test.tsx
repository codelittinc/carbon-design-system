import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../dialog";

function DialogExample() {
  return (
    <Dialog>
      <DialogTrigger>Open dialog</DialogTrigger>
      <DialogContent className="custom-dialog-content">
        <DialogHeader>
          <DialogTitle>Deposit refund</DialogTitle>
          <DialogDescription>Confirm the forwarding address.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose>Dismiss</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

describe("Dialog", () => {
  it("opens on trigger click showing title and description with dialog role", () => {
    render(<DialogExample />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Open dialog" }));

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText("Deposit refund")).toBeInTheDocument();
    expect(screen.getByText("Confirm the forwarding address.")).toBeInTheDocument();
  });

  it("forwards className to the content", () => {
    render(<DialogExample />);
    fireEvent.click(screen.getByRole("button", { name: "Open dialog" }));

    expect(screen.getByRole("dialog")).toHaveClass("custom-dialog-content");
  });

  it("closes via the built-in icon close button", () => {
    render(<DialogExample />);
    fireEvent.click(screen.getByRole("button", { name: "Open dialog" }));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();

    const iconClose = dialog.querySelector("button > svg")?.closest("button");
    expect(iconClose).not.toBeNull();
    fireEvent.click(iconClose as HTMLButtonElement);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes via a custom DialogClose child", () => {
    render(<DialogExample />);
    fireEvent.click(screen.getByRole("button", { name: "Open dialog" }));

    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
