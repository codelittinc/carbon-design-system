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

  it("fills with the accent by default and a status tone on request", () => {
    const { rerender } = render(<Progress value={10} aria-label="Done" />);
    const indicator = () => screen.getByRole("progressbar").firstElementChild as HTMLElement;
    expect(indicator()).toHaveClass("bg-accent");
    rerender(<Progress value={10} tone="success" aria-label="Done" />);
    expect(indicator()).toHaveClass("bg-success");
    expect(indicator()).not.toHaveClass("bg-accent");
  });

  it("fills relative to max", () => {
    render(<Progress value={50} max={200} />);
    const indicator = screen.getByRole("progressbar").firstElementChild as HTMLElement;
    expect(indicator).toHaveStyle({ width: "25%" });
  });

  it("clamps a value over max to a full bar, for Radix and the width", () => {
    render(<Progress value={150} max={100} aria-label="Hours" />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "100");
    expect(bar.firstElementChild).toHaveStyle({ width: "100%" });
  });

  it("clamps a negative value to an empty bar", () => {
    render(<Progress value={-5} aria-label="Hours" />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "0");
    expect(bar.firstElementChild).toHaveStyle({ width: "0%" });
  });

  it("treats max={0} as 100 rather than dividing by zero", () => {
    render(<Progress value={40} max={0} aria-label="Hours" />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
    expect(bar).toHaveAttribute("aria-valuenow", "40");
    expect(bar.firstElementChild).toHaveStyle({ width: "40%" });
  });
});
