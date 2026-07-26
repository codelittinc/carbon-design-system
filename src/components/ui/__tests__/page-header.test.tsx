import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageHeader } from "../page-header";

describe("PageHeader", () => {
  it("renders the title as a level-1 heading", () => {
    render(<PageHeader title="Dashboard" />);
    expect(screen.getByRole("heading", { level: 1, name: "Dashboard" })).toBeInTheDocument();
  });

  it("renders the description when provided", () => {
    render(<PageHeader title="Dashboard" description="Overview of your account" />);
    expect(screen.getByText("Overview of your account")).toBeInTheDocument();
  });

  it("omits the description when absent", () => {
    render(<PageHeader title="Dashboard" />);
    expect(screen.queryByText("Overview of your account")).not.toBeInTheDocument();
  });

  it("renders the actions when provided", () => {
    render(<PageHeader title="Dashboard" actions={<button>New</button>} />);
    expect(screen.getByRole("button", { name: "New" })).toBeInTheDocument();
  });

  it("merges a custom className onto the wrapper", () => {
    const { container } = render(<PageHeader title="Dashboard" className="mb-2" />);
    expect(container.firstChild).toHaveClass("mb-2");
  });
});
