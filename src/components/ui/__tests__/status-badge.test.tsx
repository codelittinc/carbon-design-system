import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusBadge } from "../status-badge";

describe("StatusBadge", () => {
  it("maps a known success status to the success variant", () => {
    render(<StatusBadge status="OPEN" />);
    expect(screen.getByText("OPEN")).toHaveClass("bg-success-soft");
  });

  it("maps VACANT_APPLICANT_PENDING to the accent variant", () => {
    render(<StatusBadge status="VACANT_APPLICANT_PENDING" />);
    const badge = screen.getByText("VACANT APPLICANT PENDING");
    expect(badge).toHaveClass("bg-accent-muted");
    expect(badge).toHaveClass("text-accent-text");
  });

  it("falls back to the default variant for an unknown status", () => {
    render(<StatusBadge status="MADE_UP" />);
    expect(screen.getByText("MADE UP")).toHaveClass("bg-surface-overlay");
  });

  it("replaces underscores with spaces in the label", () => {
    render(<StatusBadge status="PENDING_APPROVAL" />);
    expect(screen.getByText("PENDING APPROVAL")).toBeInTheDocument();
  });

  it("passes className through to the badge", () => {
    render(<StatusBadge status="OPEN" className="my-status" />);
    expect(screen.getByText("OPEN")).toHaveClass("my-status");
  });
});
