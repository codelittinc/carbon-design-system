import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Progress } from "../progress";

describe("Progress", () => {
  it("renders with the progressbar role", () => {
    render(<Progress value={40} />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("reflects the value on the indicator width", () => {
    render(<Progress value={65} />);
    const indicator = screen.getByRole("progressbar").firstElementChild as HTMLElement;
    expect(indicator).toHaveStyle({ width: "65%" });
  });

  it("defaults the indicator width to 0% when value is missing", () => {
    render(<Progress />);
    const indicator = screen.getByRole("progressbar").firstElementChild as HTMLElement;
    expect(indicator).toHaveStyle({ width: "0%" });
  });

  it("forwards className to the root", () => {
    render(<Progress value={10} className="custom-progress" />);
    expect(screen.getByRole("progressbar")).toHaveClass("custom-progress");
  });

  it("keeps the base track styling on the root", () => {
    render(<Progress value={10} />);
    expect(screen.getByRole("progressbar")).toHaveClass("rounded-full");
  });
});
