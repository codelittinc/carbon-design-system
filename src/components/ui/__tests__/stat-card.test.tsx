import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatCard } from "../stat-card";

describe("StatCard", () => {
  it("renders the label and value", () => {
    render(<StatCard label="Revenue" value="$1,200" />);
    expect(screen.getByText("Revenue")).toBeInTheDocument();
    expect(screen.getByText("$1,200")).toBeInTheDocument();
  });

  it("shows a skeleton instead of the value while loading", () => {
    const { container } = render(<StatCard label="Revenue" value="$1,200" loading />);
    expect(screen.queryByText("$1,200")).not.toBeInTheDocument();
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("colors an up trend sub-line with the success token", () => {
    render(<StatCard label="Revenue" value="1" sub="+10%" trend="up" />);
    expect(screen.getByText("+10%")).toHaveClass("text-success");
  });

  it("colors a down trend sub-line with the error token", () => {
    render(<StatCard label="Revenue" value="1" sub="-10%" trend="down" />);
    expect(screen.getByText("-10%")).toHaveClass("text-error");
  });

  it("colors a neutral trend sub-line with the muted token", () => {
    render(<StatCard label="Revenue" value="1" sub="flat" trend="neutral" />);
    expect(screen.getByText("flat")).toHaveClass("text-text-muted");
  });

  it("defaults the sub-line to the muted token when no trend is given", () => {
    render(<StatCard label="Revenue" value="1" sub="context" />);
    expect(screen.getByText("context")).toHaveClass("text-text-muted");
  });

  it("omits the sub-line when sub is not provided", () => {
    render(<StatCard label="Revenue" value="1" />);
    expect(screen.queryByText("context")).not.toBeInTheDocument();
  });
});
