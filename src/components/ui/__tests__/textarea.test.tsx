import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Textarea } from "../textarea";

describe("Textarea", () => {
  it("renders a textbox from a textarea element", () => {
    render(<Textarea aria-label="notes" />);
    const el = screen.getByRole("textbox", { name: "notes" });
    expect(el.tagName).toBe("TEXTAREA");
  });

  it("merges a custom className with the base classes", () => {
    render(<Textarea className="h-40" aria-label="notes" />);
    const el = screen.getByLabelText("notes");
    expect(el).toHaveClass("h-40");
    expect(el).toHaveClass("rounded-md");
  });

  it("forwards a ref to the underlying textarea element", () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<Textarea ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it("forwards arbitrary props and fires onChange", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Textarea placeholder="Type here" onChange={onChange} />);
    const el = screen.getByPlaceholderText("Type here");
    await user.type(el, "hi");
    expect(onChange).toHaveBeenCalled();
  });

  it("respects the disabled prop", () => {
    render(<Textarea disabled aria-label="notes" />);
    expect(screen.getByLabelText("notes")).toBeDisabled();
  });
});
