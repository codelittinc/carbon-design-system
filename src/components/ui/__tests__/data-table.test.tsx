import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DataTable, type ColumnDef } from "../data-table";

interface Row {
  name: string;
  age: number;
}

const columns: ColumnDef<Row, unknown>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "age", header: "Age" },
];

const data: Row[] = [
  { name: "Charlie", age: 30 },
  { name: "Alice", age: 25 },
  { name: "Bob", age: 35 },
];

/** Text of the first column cell for each body row, in DOM order. */
function nameColumnOrder(): string[] {
  const rows = screen.getAllByRole("row").slice(1); // drop header row
  return rows.map((r) => within(r).getAllByRole("cell")[0].textContent ?? "");
}

describe("DataTable", () => {
  it("renders header cells and row cells", () => {
    render(<DataTable columns={columns} data={data} />);
    expect(screen.getByRole("columnheader", { name: /Name/ })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /Age/ })).toBeInTheDocument();
    expect(screen.getByText("Charlie")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();
  });

  it("shows the empty message when there is no data, spanning all columns", () => {
    render(<DataTable columns={columns} data={[]} emptyMessage="Nothing here" />);
    const cell = screen.getByText("Nothing here");
    expect(cell).toBeInTheDocument();
    expect(cell).toHaveAttribute("colspan", String(columns.length));
  });

  it("toggles sort order when a sortable header is clicked", () => {
    render(<DataTable columns={columns} data={data} />);
    expect(nameColumnOrder()).toEqual(["Charlie", "Alice", "Bob"]);

    const header = screen.getByRole("columnheader", { name: /Name/ });
    fireEvent.click(header);
    expect(nameColumnOrder()).toEqual(["Alice", "Bob", "Charlie"]);

    fireEvent.click(header);
    expect(nameColumnOrder()).toEqual(["Charlie", "Bob", "Alice"]);
  });

  it("shows pagination controls only when rows exceed pageSize and navigates", () => {
    const { unmount } = render(
      <DataTable columns={columns} data={data} pageSize={25} />,
    );
    // 3 rows, pageSize 25 -> single page -> no pagination indicator.
    expect(screen.queryByText(/\/\s*\d/)).not.toBeInTheDocument();
    unmount();

    render(<DataTable columns={columns} data={data} pageSize={2} />);
    expect(screen.getByText("1 / 2")).toBeInTheDocument();

    // Two icon buttons: previous (disabled at page 1) and next.
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(2);
    const [prev, next] = buttons;
    expect(prev).toBeDisabled();

    fireEvent.click(next);
    expect(screen.getByText("2 / 2")).toBeInTheDocument();

    fireEvent.click(prev);
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
  });

  it("calls onRowClick with the row original", () => {
    const onRowClick = vi.fn();
    render(<DataTable columns={columns} data={data} onRowClick={onRowClick} />);
    fireEvent.click(screen.getByText("Alice"));
    expect(onRowClick).toHaveBeenCalledWith({ name: "Alice", age: 25 });
  });
});
