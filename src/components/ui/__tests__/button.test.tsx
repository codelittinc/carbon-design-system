import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../button";

describe("Button", () => {
  it("applies the default variant and size classes when none are passed", () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    // default variant
    expect(button).toHaveClass("bg-accent");
    // default size
    expect(button).toHaveClass("h-8");
  });

  it("maps variant prop to the matching class fragment", () => {
    render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole("button", { name: "Delete" })).toHaveClass("bg-red-600");
  });

  it("maps size prop to the matching class fragment", () => {
    render(<Button size="sm">Small</Button>);
    expect(screen.getByRole("button", { name: "Small" })).toHaveClass("h-7");
  });

  it("renders the child element when asChild is set", () => {
    render(
      <Button asChild variant="link">
        <a href="/home">Home</a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Home" });
    expect(link).toHaveAttribute("href", "/home");
    // variant classes flow onto the child element
    expect(link).toHaveClass("underline-offset-4");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("forwards className alongside the variant classes", () => {
    render(<Button className="custom-class">Styled</Button>);
    const button = screen.getByRole("button", { name: "Styled" });
    expect(button).toHaveClass("custom-class");
    expect(button).toHaveClass("bg-accent");
  });

  it("forwards the ref to the underlying button element", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Ref</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("respects the disabled prop", async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Disabled
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Disabled" });
    expect(button).toBeDisabled();
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("invokes the click handler when clicked", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    await userEvent.click(screen.getByRole("button", { name: "Click" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
