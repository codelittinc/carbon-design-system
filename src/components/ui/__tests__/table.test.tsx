import { createRef } from "react";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "../table";

function Example() {
  return (
    <Table aria-label="Hours">
      <TableHeader>
        <TableRow>
          <TableHead>Project</TableHead>
          <TableHead className="text-right">Hours</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Backstage</TableCell>
          <TableCell className="px-1">32h</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell>Total</TableCell>
          <TableCell>32</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}

describe("Table", () => {
  it("renders a real table, so its rows and headers are announced as such", () => {
    render(<Example />);
    const table = screen.getByRole("table", { name: "Hours" });
    expect(within(table).getAllByRole("row")).toHaveLength(3);
    expect(within(table).getAllByRole("columnheader").map((th) => th.textContent)).toEqual([
      "Project",
      "Hours",
    ]);
  });

  it("merges a caller's classes over the defaults", () => {
    render(<Example />);
    const hours = screen.getByRole("columnheader", { name: "Hours" });
    expect(hours).toHaveClass("text-right");
    expect(hours).not.toHaveClass("text-left");
    const cell = screen.getByRole("cell", { name: "32h" });
    expect(cell).toHaveClass("px-1", "py-2");
    expect(cell).not.toHaveClass("px-3");
  });

  it("forwards the ref", () => {
    const ref = createRef<HTMLTableElement>();
    render(<Table ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTableElement);
  });
});
