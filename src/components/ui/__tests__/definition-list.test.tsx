import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DefinitionItem, DefinitionList } from "../definition-list";

describe("DefinitionList", () => {
  it("defaults to a 2-column grid", () => {
    const { container } = render(
      <DefinitionList>
        <div />
      </DefinitionList>,
    );
    expect(container.firstChild).toHaveClass("grid-cols-2");
  });

  it("uses a single column when columns is 1", () => {
    const { container } = render(
      <DefinitionList columns={1}>
        <div />
      </DefinitionList>,
    );
    expect(container.firstChild).toHaveClass("grid-cols-1");
  });

  it("uses three columns when columns is 3", () => {
    const { container } = render(
      <DefinitionList columns={3}>
        <div />
      </DefinitionList>,
    );
    expect(container.firstChild).toHaveClass("grid-cols-3");
  });

  it("merges a custom className onto the grid", () => {
    const { container } = render(
      <DefinitionList className="mt-4">
        <div />
      </DefinitionList>,
    );
    expect(container.firstChild).toHaveClass("mt-4");
  });

  it("renders its children", () => {
    render(
      <DefinitionList>
        <span>child content</span>
      </DefinitionList>,
    );
    expect(screen.getByText("child content")).toBeInTheDocument();
  });
});

describe("DefinitionItem", () => {
  it("renders the label and value children", () => {
    render(<DefinitionItem label="Status">Active</DefinitionItem>);
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("merges a custom className onto the wrapper", () => {
    const { container } = render(
      <DefinitionItem label="Status" className="col-span-2">
        Active
      </DefinitionItem>,
    );
    expect(container.firstChild).toHaveClass("col-span-2");
  });
});
