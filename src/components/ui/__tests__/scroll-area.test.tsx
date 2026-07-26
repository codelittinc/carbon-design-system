import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ScrollArea } from "../scroll-area";

describe("ScrollArea", () => {
  it("renders its children content", () => {
    render(
      <ScrollArea>
        <p>Scrollable body</p>
      </ScrollArea>,
    );
    expect(screen.getByText("Scrollable body")).toBeInTheDocument();
  });

  it("forwards className to the root", () => {
    const { container } = render(
      <ScrollArea className="custom-scroll">
        <p>Body</p>
      </ScrollArea>,
    );
    expect(container.firstChild).toHaveClass("custom-scroll");
  });

  it("keeps the base overflow-hidden class on the root", () => {
    const { container } = render(
      <ScrollArea className="custom-scroll">
        <p>Body</p>
      </ScrollArea>,
    );
    expect(container.firstChild).toHaveClass("overflow-hidden");
  });
});
