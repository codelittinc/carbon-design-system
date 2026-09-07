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

/** Body rows in DOM order, header dropped. */
function bodyRows(): HTMLElement[] {
  return screen.getAllByRole("row").slice(1);
}

const classesOf = (row: HTMLElement) => (row.getAttribute("class") ?? "").split(/\s+/);
const has = (row: HTMLElement, cls: string) => classesOf(row).includes(cls);

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

  /*
   * Row backgrounds. jsdom applies no stylesheet, so these assert the class
   * strings — which is also where the bugs are: every one of these rules was
   * once expressed as a class that quietly lost to another one on the row.
   */
  describe("row backgrounds", () => {
    it("hovers every row, whether or not the row does anything when clicked", () => {
      // The regression this pins: hover used to ride along with `cursor-pointer`
      // on `onRowClick`, so a read-only table had no hover at all and there was
      // no way for a consumer to ask for one.
      const { unmount } = render(<DataTable columns={columns} data={data} />);
      expect(bodyRows()).toHaveLength(3);
      bodyRows().forEach((row) => {
        expect(has(row, "hover:bg-table-row-hover")).toBe(true);
        expect(has(row, "cursor-pointer")).toBe(false);
      });
      unmount();

      render(<DataTable columns={columns} data={data} onRowClick={() => {}} />);
      bodyRows().forEach((row) => {
        expect(has(row, "hover:bg-table-row-hover")).toBe(true);
        expect(has(row, "cursor-pointer")).toBe(true);
      });
    });

    it("stripes alternate rows, leaving the first one plain", () => {
      render(<DataTable columns={columns} data={data} />);
      expect(bodyRows().map((row) => has(row, "bg-table-stripe"))).toEqual([
        false,
        true,
        false,
      ]);
    });

    it("starts the banding again on every page", () => {
      // Keyed to the index within the page, not a running count: page 2 of a
      // 3-row page would otherwise open on a stripe and the table would look
      // like it had shifted.
      const rows = Array.from({ length: 5 }, (_, i) => ({ name: `row${i}`, age: i }));
      render(<DataTable columns={columns} data={rows} pageSize={3} />);
      expect(bodyRows().map((row) => has(row, "bg-table-stripe"))).toEqual([
        false,
        true,
        false,
      ]);

      fireEvent.click(screen.getAllByRole("button").at(-1)!);
      expect(nameColumnOrder()).toEqual(["row3", "row4"]);
      expect(bodyRows().map((row) => has(row, "bg-table-stripe"))).toEqual([false, true]);
    });

    it("leaves a selected row its own background, and no hover over it", () => {
      const selectable: ColumnDef<Row, unknown>[] = [
        ...columns,
        {
          id: "select",
          header: "Select",
          cell: ({ row }) => (
            <button onClick={() => row.toggleSelected()}>select {row.original.name}</button>
          ),
        },
      ];
      render(<DataTable columns={selectable} data={data} enableSelection />);

      // Alice is row 2, so she carries the stripe until she is selected.
      const alice = () => bodyRows()[1];
      expect(has(alice(), "bg-table-stripe")).toBe(true);

      fireEvent.click(screen.getByText("select Alice"));

      // One background on a row, and selection is the one that means something:
      // twMerge drops the stripe rather than letting source order decide.
      expect(has(alice(), "bg-accent-muted")).toBe(true);
      expect(has(alice(), "bg-table-stripe")).toBe(false);
      // And the pointer must not wash the selection away.
      expect(has(alice(), "hover:bg-table-row-hover")).toBe(false);

      // Her unselected neighbours are untouched.
      expect(has(bodyRows()[0], "hover:bg-table-row-hover")).toBe(true);
      expect(has(bodyRows()[2], "hover:bg-table-row-hover")).toBe(true);
    });
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
