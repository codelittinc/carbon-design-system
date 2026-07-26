import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Input } from "../input";

describe("Input", () => {
  it("renders a textbox", () => {
    render(<Input />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("forwards the type attribute", () => {
    render(<Input type="email" aria-label="email" />);
    expect(screen.getByLabelText("email")).toHaveAttribute("type", "email");
  });

  it("merges a custom className with the base classes", () => {
    render(<Input className="pl-9" aria-label="field" />);
    const input = screen.getByLabelText("field");
    expect(input).toHaveClass("pl-9");
    expect(input).toHaveClass("rounded-md");
  });

  it("forwards a ref to the underlying input element", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("supports controlled value and onChange", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Input value="" onChange={onChange} aria-label="name" />);
    await user.type(screen.getByLabelText("name"), "a");
    expect(onChange).toHaveBeenCalled();
  });

  it("respects the disabled prop", () => {
    render(<Input disabled aria-label="disabled-field" />);
    expect(screen.getByLabelText("disabled-field")).toBeDisabled();
  });
});
