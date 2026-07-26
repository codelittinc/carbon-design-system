import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../tooltip";

function TooltipExample() {
  return (
    <TooltipProvider>
      <Tooltip open>
        <TooltipTrigger>Hover me</TooltipTrigger>
        <TooltipContent className="custom-tooltip-content">
          Helpful hint
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

describe("Tooltip", () => {
  it("renders the trigger", () => {
    render(<TooltipExample />);
    expect(screen.getByRole("button", { name: "Hover me" })).toBeInTheDocument();
  });

  it("exposes tooltip content with the tooltip role when open", () => {
    render(<TooltipExample />);

    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    // Radix duplicates content for screen readers; there is always a visible copy.
    expect(screen.getAllByText("Helpful hint").length).toBeGreaterThan(0);
  });

  it("forwards className to the content when open", () => {
    render(<TooltipExample />);
    // Radix exposes role="tooltip" on an sr-only node; the styled content is
    // the visible copy that carries the forwarded className.
    const content = document.querySelector(".custom-tooltip-content");
    expect(content).not.toBeNull();
    expect(content).toHaveTextContent("Helpful hint");
  });
});
