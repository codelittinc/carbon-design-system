import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Tag } from "../tag";

describe("Tag", () => {
  it("renders its children with the badge variant", () => {
    render(<Tag variant="success">Ana</Tag>);
    expect(screen.getByText("Ana").className).toContain("bg-success-soft");
  });

  it("has no remove button without onRemove", () => {
    render(<Tag>Ana</Tag>);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("calls onRemove from a labelled button", () => {
    const onRemove = vi.fn();
    render(
      <Tag onRemove={onRemove} removeLabel="Remove Ana">
        Ana
      </Tag>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Remove Ana" }));
    expect(onRemove).toHaveBeenCalledOnce();
  });
});
