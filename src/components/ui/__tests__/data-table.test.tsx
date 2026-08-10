import { useMemo, useState } from "react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
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

  describe("page reset", () => {
    const many = (n: number) =>
      Array.from({ length: n }, (_, i) => ({ name: `row${i}`, age: i }));

    /** Drives DataTable the way a filtered list screen does. */
    function Host({ withSignature }: { withSignature: boolean }) {
      const [rows, setRows] = useState(24);
      const [nonce, setNonce] = useState(0);
      const [filter, setFilter] = useState("a");
      const data = useMemo(() => many(rows), [rows, nonce]);
      return (
        <div>
          {/* A refresh: same rows, new array — what a refetch after an edit produces. */}
          <button onClick={() => setNonce((v) => v + 1)}>refetch</button>
          <button onClick={() => setFilter((f) => f + "!")}>filter</button>
          <button onClick={() => setRows(22)}>shrink</button>
          <DataTable
            columns={columns}
            data={data}
            pageSize={10}
            {...(withSignature ? { resetPageOn: filter } : {})}
          />
        </div>
      );
    }

    const page = () => screen.getByText(/^\d+ \/ \d+$/).textContent;

    async function toLastPage() {
      await act(async () => {});
      const next = () => screen.getAllByRole("button", { name: "" }).at(-1)!;
      fireEvent.click(next());
      fireEvent.click(next());
      await act(async () => {});
      expect(page()).toBe("3 / 3");
    }

    const click = async (name: string) => {
      await act(async () => {
        fireEvent.click(screen.getByText(name));
      });
    };

    it("returns to page 1 on any data change by default", async () => {
      render(<Host withSignature={false} />);
      await toLastPage();

      // Both a refresh and a real narrowing reset, because both replace `data`.
      await click("refetch");
      expect(page()).toBe("1 / 3");

      await toLastPage();
      await click("shrink");
      expect(page()).toBe("1 / 3");
    });

    it("with resetPageOn, resets on the signature and holds place on a refresh", async () => {
      render(<Host withSignature />);
      await toLastPage();

      // A refetch of the same list must not move the reader.
      await click("refetch");
      expect(page()).toBe("3 / 3");

      // A filter change must.
      await click("filter");
      expect(page()).toBe("1 / 3");
    });

    it("with resetPageOn, never leaves the reader past the last page", async () => {
      render(<Host withSignature />);
      await toLastPage();

      // Shrinking without a signature change keeps pageIndex, so the page must still
      // be one that exists — TanStack clamps the displayed page to the last one.
      await click("shrink");
      expect(page()).toBe("3 / 3");
      expect(nameColumnOrder()).toEqual(["row20", "row21"]);
    });
  });
});
