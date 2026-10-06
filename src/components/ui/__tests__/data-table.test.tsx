import { useMemo, useState } from "react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DataTable, type ColumnDef, type SortingState } from "../data-table";

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

    // The sort is a button in the heading, so Tab and Enter reach it too.
    const sort = screen.getByRole("button", { name: /Name/ });
    expect(sort).toHaveAttribute("type", "button");
    fireEvent.click(sort);
    expect(nameColumnOrder()).toEqual(["Alice", "Bob", "Charlie"]);

    fireEvent.click(sort);
    expect(nameColumnOrder()).toEqual(["Charlie", "Bob", "Alice"]);
  });

  it("never nests a button: a header with its own control sorts from a separate button", () => {
    const withControl: ColumnDef<Row, unknown>[] = [
      {
        accessorKey: "name",
        header: () => (
          <span>
            Name <button type="button">Help</button>
          </span>
        ),
      },
      { accessorKey: "age", header: "Age" },
    ];
    const { container } = render(<DataTable columns={withControl} data={data} />);
    expect(container.querySelector("button button")).toBeNull();

    // The header's own control is still there, and the column still sorts.
    const heading = screen.getAllByRole("columnheader")[0];
    expect(within(heading).getByRole("button", { name: "Help" })).toBeInTheDocument();
    fireEvent.click(within(heading).getByRole("button", { name: "Sort by name" }));
    expect(nameColumnOrder()).toEqual(["Alice", "Bob", "Charlie"]);
  });

  it("lets a long text header wrap instead of truncating it", () => {
    const long: ColumnDef<Row, unknown>[] = [
      { accessorKey: "name", header: "Name of the person the row belongs to" },
      { accessorKey: "age", header: "Age" },
    ];
    render(<DataTable columns={long} data={data} />);
    const sort = screen.getByRole("button", { name: /Name of the person/ });
    expect(sort).toHaveClass("whitespace-normal", "h-auto", "text-left");
    expect(sort).not.toHaveClass("whitespace-nowrap");
    // Nothing inside it truncates either.
    expect(sort.querySelector(".truncate, .whitespace-nowrap")).toBeNull();
  });

  it("shows pagination controls only when rows exceed pageSize and navigates", () => {
    const { unmount } = render(
      <DataTable columns={columns} data={data} pageSize={25} />,
    );
    // 3 rows, pageSize 25 -> single page -> no pager.
    expect(screen.queryByRole("navigation", { name: "Pagination" })).not.toBeInTheDocument();
    unmount();

    render(<DataTable columns={columns} data={data} pageSize={2} />);
    const pager = screen.getByRole("navigation", { name: "Pagination" });
    expect(within(pager).getByText(/Showing 1–2 of/)).toHaveTextContent("Showing 1–2 of 3");

    // The shared Pagination: named buttons that never submit a form.
    const prev = within(pager).getByRole("button", { name: "Previous page" });
    const next = within(pager).getByRole("button", { name: "Next page" });
    for (const button of within(pager).getAllByRole("button")) {
      expect(button).toHaveAttribute("type", "button");
    }
    expect(prev).toBeDisabled();

    fireEvent.click(next);
    expect(within(pager).getByRole("button", { name: "Page 2" })).toHaveAttribute("aria-current", "page");

    fireEvent.click(prev);
    expect(within(pager).getByRole("button", { name: "Page 1" })).toHaveAttribute("aria-current", "page");
  });

  it("pages without submitting a form around it", () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <DataTable columns={columns} data={data} pageSize={2} />
      </form>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    fireEvent.click(screen.getByRole("button", { name: /Name/ }));
    expect(onSubmit).not.toHaveBeenCalled();
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
          <button onClick={() => setRows(15)}>shrink</button>
          <DataTable
            columns={columns}
            data={data}
            pageSize={10}
            {...(withSignature ? { resetPageOn: filter } : {})}
          />
        </div>
      );
    }

    const page = () => {
      const current = screen.getByRole("button", { current: "page" });
      const last = screen.getAllByRole("button", { name: /^Page \d+$/ }).at(-1)!;
      return `${current.textContent} / ${last.textContent}`;
    };

    async function toLastPage() {
      await act(async () => {});
      const next = () => screen.getByRole("button", { name: "Next page" });
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
      expect(page()).toBe("1 / 2");
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

      // 24 rows to 15 with no signature change: page 3 no longer exists, so the
      // reader lands on the new last page rather than an empty one.
      await click("shrink");
      expect(page()).toBe("2 / 2");
      expect(screen.queryByText(/Showing 21–15 of 15/)).not.toBeInTheDocument();
      expect(screen.getByText(/Showing 11–15 of 15/)).toBeInTheDocument();
      expect(nameColumnOrder()).toEqual(["row10", "row11", "row12", "row13", "row14"]);
    });
  });

  describe("paginate={false}", () => {
    const many = (n: number): Row[] =>
      Array.from({ length: n }, (_, i) => ({ name: `Person ${i + 1}`, age: 20 + i }));

    it("renders every row it is given, with no pager", () => {
      render(<DataTable columns={columns} data={many(30)} pageSize={5} paginate={false} />);
      expect(bodyRows()).toHaveLength(30);
      expect(screen.queryByText(/\d+ \/ \d+/)).not.toBeInTheDocument();
    });

    it("keeps rendering every row when the list grows after mount", () => {
      const { rerender } = render(
        <DataTable columns={columns} data={many(1)} paginate={false} />,
      );
      rerender(<DataTable columns={columns} data={many(40)} paginate={false} />);
      expect(bodyRows()).toHaveLength(40);
    });
  });

  describe("getRowId", () => {
    // A cell that holds its own state, like an inline rename box.
    function Note({ initial }: { initial: string }) {
      const [value] = useState(initial);
      return <span data-testid="note">{value}</span>;
    }
    const noteColumns: ColumnDef<Row, unknown>[] = [
      { id: "note", header: "Note", cell: ({ row }) => <Note initial={row.original.name} /> },
    ];
    const notes = () => screen.getAllByTestId("note").map((n) => n.textContent);

    it("keeps a row's own state with that row when the list re-sorts", () => {
      const { rerender } = render(
        <DataTable columns={noteColumns} data={data} getRowId={(r) => r.name} />,
      );
      rerender(
        <DataTable columns={noteColumns} data={[...data].reverse()} getRowId={(r) => r.name} />,
      );
      expect(notes()).toEqual(["Bob", "Alice", "Charlie"]);
    });

    it("without it, the state stays with the index (the case it fixes)", () => {
      const { rerender } = render(<DataTable columns={noteColumns} data={data} />);
      rerender(<DataTable columns={noteColumns} data={[...data].reverse()} />);
      expect(notes()).toEqual(["Charlie", "Alice", "Bob"]);
    });
  });
  describe("column meta", () => {
    const aligned: ColumnDef<Row, unknown>[] = [
      { accessorKey: "name", header: "Name", meta: { className: "w-40", headerClassName: "w-48" } },
      { accessorKey: "age", header: "Age", meta: { align: "right" } },
    ];

    it("aligns the header and the cells", () => {
      render(<DataTable columns={aligned} data={data} />);
      const header = screen.getByRole("columnheader", { name: /Age/ });
      expect(header).toHaveClass("text-right");
      expect(header.firstElementChild).toHaveClass("justify-end");
      expect(screen.getByText("25")).toHaveClass("text-right");
      // Unaligned columns keep today's left alignment.
      expect(screen.getByRole("columnheader", { name: /Name/ })).toHaveClass("text-left");
    });

    it("adds the column's cell and header classes", () => {
      render(<DataTable columns={aligned} data={data} />);
      expect(screen.getByRole("columnheader", { name: /Name/ })).toHaveClass("w-48");
      expect(screen.getByText("Alice")).toHaveClass("w-40");
    });
  });

  it("merges rowClassName over the stripe", () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        rowClassName={(row) => (row.name === "Alice" ? "bg-error-soft opacity-60" : undefined)}
      />,
    );
    // Alice is the striped second row; her own tint replaces the stripe.
    const alice = bodyRows()[1];
    expect(has(alice, "bg-error-soft")).toBe(true);
    expect(has(alice, "opacity-60")).toBe(true);
    expect(has(alice, "bg-table-stripe")).toBe(false);
    expect(has(bodyRows()[0], "opacity-60")).toBe(false);
  });

  describe("controlled sorting", () => {
    function Server({ onSort }: { onSort: (s: SortingState) => void }) {
      const [sorting, setSorting] = useState<SortingState>([{ id: "name", desc: false }]);
      return (
        <DataTable
          columns={columns}
          data={data}
          sorting={sorting}
          manualSorting
          onSortingChange={(s) => {
            setSorting(s);
            onSort(s);
          }}
        />
      );
    }

    it("reports header clicks and leaves the order to the server", () => {
      const onSort = vi.fn();
      render(<Server onSort={onSort} />);
      // Shown as given, though the sort says name ascending.
      expect(nameColumnOrder()).toEqual(["Charlie", "Alice", "Bob"]);
      const name = screen.getByRole("columnheader", { name: /Name/ });
      expect(name).toHaveAttribute("aria-sort", "ascending");

      fireEvent.click(within(name).getByRole("button"));
      expect(onSort).toHaveBeenLastCalledWith([{ id: "name", desc: true }]);
      expect(name).toHaveAttribute("aria-sort", "descending");
      expect(nameColumnOrder()).toEqual(["Charlie", "Alice", "Bob"]);
    });

    it("sorts the rows itself when controlled without manualSorting", () => {
      render(<DataTable columns={columns} data={data} sorting={[{ id: "age", desc: true }]} />);
      expect(nameColumnOrder()).toEqual(["Bob", "Charlie", "Alice"]);
    });

    it("still reports changes while uncontrolled", () => {
      const onSortingChange = vi.fn();
      render(<DataTable columns={columns} data={data} onSortingChange={onSortingChange} />);
      fireEvent.click(screen.getByRole("button", { name: /Name/ }));
      expect(onSortingChange).toHaveBeenCalledWith([{ id: "name", desc: false }]);
      expect(nameColumnOrder()).toEqual(["Alice", "Bob", "Charlie"]);
    });
  });

  describe("expandable rows", () => {
    const detail = (row: Row) => <p>{row.name} is {row.age}</p>;

    it("adds a toggle per row that shows the detail in a full-width row underneath", () => {
      render(<DataTable columns={columns} data={data} renderExpanded={detail} />);
      const toggles = screen.getAllByRole("button", { name: "Show details" });
      expect(toggles).toHaveLength(3);
      expect(toggles[1]).toHaveAttribute("aria-expanded", "false");
      expect(screen.queryByText("Alice is 25")).not.toBeInTheDocument();

      fireEvent.click(toggles[1]);
      expect(toggles[1]).toHaveAttribute("aria-expanded", "true");
      const cell = screen.getByText("Alice is 25").closest("td")!;
      // Spans the data columns plus the toggle column.
      expect(cell).toHaveAttribute("colspan", "3");
      expect(cell.closest("tr")).toHaveClass("bg-surface-raised");
      expect(toggles[1]).toHaveAttribute("aria-controls", cell.closest("tr")!.id);

      fireEvent.click(toggles[1]);
      expect(screen.queryByText("Alice is 25")).not.toBeInTheDocument();
    });

    it("does not fire onRowClick from the toggle", () => {
      const onRowClick = vi.fn();
      render(<DataTable columns={columns} data={data} renderExpanded={detail} onRowClick={onRowClick} />);
      fireEvent.click(screen.getAllByRole("button", { name: "Show details" })[0]);
      expect(onRowClick).not.toHaveBeenCalled();
      fireEvent.click(screen.getByText("Alice"));
      expect(onRowClick).toHaveBeenCalledWith(data[1]);
      // Without expandOnRowClick a row click leaves the row closed.
      expect(screen.queryByText("Alice is 25")).not.toBeInTheDocument();
    });

    it("toggles from anywhere on the row with expandOnRowClick", () => {
      render(<DataTable columns={columns} data={data} renderExpanded={detail} expandOnRowClick />);
      fireEvent.click(screen.getByText("Bob"));
      expect(screen.getByText("Bob is 35")).toBeInTheDocument();
    });

    it("gives a toggle only to rows getRowCanExpand allows", () => {
      render(
        <DataTable
          columns={columns}
          data={data}
          renderExpanded={detail}
          getRowCanExpand={(row) => row.age > 26}
        />,
      );
      expect(screen.getAllByRole("button", { name: "Show details" })).toHaveLength(2);
      // The toggle column is still there, so the columns line up.
      expect(within(bodyRows()[1]).getAllByRole("cell")).toHaveLength(3);
    });

    it("keeps rows open across a refetch when keyed by getRowId", () => {
      const { rerender } = render(
        <DataTable columns={columns} data={data} renderExpanded={detail} getRowId={(r) => r.name} />,
      );
      fireEvent.click(screen.getAllByRole("button", { name: "Show details" })[2]);
      rerender(
        <DataTable
          columns={columns}
          data={[{ name: "Zed", age: 1 }, ...data.map((r) => ({ ...r }))]}
          renderExpanded={detail}
          getRowId={(r) => r.name}
        />,
      );
      expect(screen.getByText("Bob is 35")).toBeInTheDocument();
    });

    it("adds no column without renderExpanded", () => {
      render(<DataTable columns={columns} data={data} />);
      expect(screen.getAllByRole("columnheader")).toHaveLength(2);
    });
  });
});
