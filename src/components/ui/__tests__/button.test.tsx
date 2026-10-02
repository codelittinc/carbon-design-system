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

  /*
   * Truncation.
   *
   * A label long enough to exceed the button used to WRAP, and since every size
   * is a fixed height the second line spilled out through the button's own
   * border. `whitespace-nowrap` stops that; the wrapper below is what lets the
   * label end in an ellipsis rather than being cut mid-word.
   */

  it("never wraps a label onto a second line", () => {
    render(<Button>Connect another company</Button>);
    expect(screen.getByRole("button", { name: "Connect another company" })).toHaveClass(
      "whitespace-nowrap",
    );
  });

  it("wraps a text label so it can truncate", () => {
    // `text-overflow` needs a block container, and a bare string in a flex parent
    // is an anonymous flex item — there is no element for an ellipsis to apply
    // to, so `truncate` on the button alone does nothing for it.
    render(<Button>Connect another company</Button>);
    const label = screen.getByText("Connect another company");
    expect(label.tagName).toBe("SPAN");
    expect(label).toHaveClass("truncate");
  });

  it("leaves an icon a sibling of the label, not a child of it", () => {
    // The gap between them is a flex gap. Folding both into one span would
    // collapse it, and would stop the label truncating independently.
    render(
      <Button>
        <svg data-testid="icon" />
        Connect another company
      </Button>,
    );
    const icon = screen.getByTestId("icon");
    const label = screen.getByText("Connect another company");
    expect(icon.parentElement).toBe(label.parentElement);
    expect(label.contains(icon)).toBe(false);
  });

  it("keeps a label built from text and expressions in one span, spaces intact", () => {
    // JSX splits this into three string children. One span each made each a flex
    // item, which drops the spaces at their edges.
    const purpose = "operating";
    const count = 3;
    render(
      <Button>
        <svg data-testid="icon" />
        Create {purpose} account ({count})
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Create operating account (3)" });
    const labels = button.querySelectorAll("span");
    expect(labels).toHaveLength(1);
    expect(labels[0]).toHaveTextContent("Create operating account (3)");
    expect(labels[0]).toHaveClass("truncate");
    expect(screen.getByTestId("icon").parentElement).toBe(button);
  });

  it("keeps text on either side of an element as separate labels", () => {
    render(
      <Button>
        Before <svg data-testid="icon" /> after {1}
      </Button>,
    );
    const button = screen.getByRole("button");
    const labels = Array.from(button.querySelectorAll("span")).map((s) => s.textContent);
    expect(labels).toEqual(["Before ", " after 1"]);
  });

  it("passes elements through untouched, so a consumer keeps the DOM they wrote", () => {
    render(
      <Button>
        <span data-testid="own">Already wrapped</span>
      </Button>,
    );
    const own = screen.getByTestId("own");
    expect(own).not.toHaveClass("truncate");
    expect(own.parentElement?.tagName).toBe("BUTTON");
  });

  it("adds no wrapper under asChild, where Slot requires a single child", () => {
    render(
      <Button asChild variant="link">
        <a href="/home">Home</a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Home" });
    expect(link.querySelector("span")).toBeNull();
    expect(link.textContent).toBe("Home");
  });

  it("keeps an icon button from being squashed in a flex row", () => {
    // `min-w-0` lets a labelled button shrink so its label can truncate. A single
    // glyph has nothing to give, so the icon size opts back out.
    render(<Button size="icon" aria-label="Close" />);
    expect(screen.getByRole("button", { name: "Close" })).toHaveClass("shrink-0");
  });

  it("invokes the click handler when clicked", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    await userEvent.click(screen.getByRole("button", { name: "Click" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
