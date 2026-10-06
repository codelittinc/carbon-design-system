"use client";

import {
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type ExpandedState,
  type RowData,
  type RowSelectionState,
  type Updater,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Fragment, useEffect, useId, useRef, useState, type ReactElement } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronRight as ChevronExpand } from "lucide-react";
import { cn } from "@/lib/cn";
import { tableRowHoverClass } from "@/lib/ui-classes";
import { Button } from "./button";
import { Pagination } from "./pagination";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "./table";
import { TableEmptyRow } from "./table-empty-row";

/**
 * Per-column presentation, set on a column's `meta`:
 *
 * ```ts
 * { accessorKey: "amount", header: "Amount", meta: { align: "right", className: "w-32" } }
 * ```
 *
 * Declared on TanStack's own `ColumnMeta` so it typechecks in the consumer's
 * column definitions with no cast.
 */
declare module "@tanstack/react-table" {
  // The type parameters must match TanStack's declaration to merge with it.
  interface ColumnMeta<TData extends RowData, TValue> {
    /** Aligns the header and the cells. Right for numbers. Defaults to left. */
    align?: "left" | "right" | "center";
    /** Extra classes on every body cell in the column — a width, `whitespace-nowrap`. */
    className?: string;
    /** Extra classes on the column's header cell. */
    headerClassName?: string;
  }
}

const alignClasses = {
  left: { cell: "text-left", header: "text-left", content: "justify-start" },
  right: { cell: "text-right", header: "text-right", content: "justify-end" },
  center: { cell: "text-center", header: "text-center", content: "justify-center" },
};

interface DataTableProps<TData, TValue> {
  /**
   * TanStack column definitions. Give a column a `footer` (a string, or a
   * function of the table: `({ table }) => total(table.getFilteredRowModel().rows)`)
   * and the table gets a footer row, for totals.
   */
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRowClick?: (row: TData) => void;
  pageSize?: number;
  /**
   * `false` turns the table's own paging off and renders every row it is given.
   * For a list the server already pages: hand it one page of rows and put a
   * `Pagination` under it. Otherwise `pageSize`, which is read once on mount,
   * would cut a page the server sent and add a second pager inside the real one.
   */
  paginate?: boolean;
  /**
   * A stable id per row, used as its React key. Without it rows are keyed by
   * index, so a cell that holds its own state (an inline rename, an open menu)
   * moves to a different row when the list re-sorts or gains a row.
   */
  getRowId?: (row: TData) => string;
  enableSelection?: boolean;
  emptyMessage?: string;
  /**
   * What a page reset keys off.
   *
   * By default the page returns to 1 whenever `data` changes — TanStack's
   * `autoResetPageIndex`. That is right for a filter change and wrong for a refresh,
   * because both hand us a new array: re-fetching the same list after a row edit
   * throws the reader back to page 1, and on a long list they have to page forward
   * again for every edit.
   *
   * Pass a value that identifies the *filters* (a string of their current values, say)
   * and the page resets when that changes instead of on every `data` change. A refresh
   * then keeps the reader where they were, and unlike remounting the table on a `key`,
   * the column sort survives.
   */
  resetPageOn?: unknown;
  /** Extra classes for a row, applied after the stripe and hover so a tint wins. */
  rowClassName?: (row: TData) => string | undefined;
  /**
   * Controlled sort. Without it the table keeps its own sort state, as before.
   * With `manualSorting` the table only reports header clicks through
   * `onSortingChange` and shows `data` in the order given — for a server sort.
   */
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
  manualSorting?: boolean;
  /**
   * Detail shown in a full-width row under an expanded row — an audit entry's
   * changed fields, say. Setting it adds a leading column with a toggle button
   * on every row that can expand. Pair with `getRowId` so a refetch keeps the
   * same rows open.
   */
  renderExpanded?: (row: TData) => React.ReactNode;
  /** Which rows get a toggle. Defaults to every row when `renderExpanded` is set. */
  getRowCanExpand?: (row: TData) => boolean;
  /**
   * A click anywhere on an expandable row toggles it too, not just the button.
   * `onRowClick` still fires for those clicks; a click on the button itself
   * never reaches `onRowClick`.
   */
  expandOnRowClick?: boolean;
}

/** Distinguishes "prop omitted" from any value a caller could legitimately pass. */
const UNSET = Symbol("DataTable.resetPageOn.unset");

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
  pageSize = 25,
  paginate = true,
  getRowId,
  enableSelection = false,
  emptyMessage = "No results.",
  resetPageOn = UNSET,
  rowClassName,
  sorting: controlledSorting,
  onSortingChange,
  manualSorting = false,
  renderExpanded,
  getRowCanExpand,
  expandOnRowClick = false,
}: DataTableProps<TData, TValue>): ReactElement {
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const expandable = renderExpanded !== undefined;
  const detailId = useId();
  // The toggle column, when there is one, is not a column def: it would show up
  // in the consumer's column model, and in sorting and visibility.
  const colCount = columns.length + (expandable ? 1 : 0);
  const [internalSorting, setInternalSorting] = useState<SortingState>([]);
  const sorting = controlledSorting ?? internalSorting;
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const driven = resetPageOn !== UNSET;

  function handleSortingChange(updater: Updater<SortingState>) {
    const next = typeof updater === "function" ? updater(sorting) : updater;
    if (controlledSorting === undefined) setInternalSorting(next);
    onSortingChange?.(next);
  }

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: paginate ? getPaginationRowModel() : undefined,
    getRowId: getRowId ? (row) => getRowId(row) : undefined,
    manualSorting,
    onSortingChange: handleSortingChange,
    getRowCanExpand: expandable
      ? (row) => (getRowCanExpand ? getRowCanExpand(row.original) : true)
      : () => false,
    onExpandedChange: setExpanded,
    // Hold rows open across a refetch; `getRowId` keeps them the same rows.
    autoResetExpanded: false,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: enableSelection,
    // Hand the reset over to the effect below only when the caller opted in, so the
    // default stays exactly TanStack's.
    autoResetPageIndex: !driven,
    state: { sorting, columnFilters, rowSelection, expanded },
    initialState: { pagination: { pageSize } },
  });

  // A footer row (totals, say) when any column defines a `footer`: TanStack's
  // own column option, rendered with the column's alignment and classes.
  const hasFooter = table.getAllLeafColumns().some((column) => column.columnDef.footer !== undefined);

  // Mount already starts on page 1, so only *changes* to the signature reset.
  const seen = useRef(resetPageOn);
  useEffect(() => {
    if (!driven || Object.is(seen.current, resetPageOn)) return;
    seen.current = resetPageOn;
    table.setPageIndex(0);
  }, [driven, resetPageOn, table]);

  // A list that shrinks (a refetch after a delete, with `resetPageOn` holding
  // the page) can leave the page past the last one: an empty body over
  // "Showing 21–15 of 15". Move back to the last page that exists.
  const pageIndex = table.getState().pagination.pageIndex;
  const lastPage = Math.max(0, table.getPageCount() - 1);
  useEffect(() => {
    if (paginate && pageIndex > lastPage) table.setPageIndex(lastPage);
  }, [paginate, pageIndex, lastPage, table]);

  return (
    <div>
      {/* A table wider than its container scrolls inside its border rather
          than pushing the page sideways. */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {expandable && (
                  <TableHead className="w-10 px-1 py-2">
                    <span className="sr-only">Details</span>
                  </TableHead>
                )}
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta;
                  const align = alignClasses[meta?.align ?? "left"];
                  const sorted = header.column.getIsSorted();
                  const canSort = header.column.getCanSort();
                  const SortIcon =
                    sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ArrowUpDown;
                  const sortIcon = (
                    <SortIcon
                      size={12}
                      aria-hidden="true"
                      className={sorted ? "text-text-secondary" : "text-text-faint"}
                    />
                  );
                  const label = header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext());
                  return (
                    <TableHead
                      key={header.id}
                      aria-sort={
                        sorted === "asc"
                          ? "ascending"
                          : sorted === "desc"
                            ? "descending"
                            : undefined
                      }
                      className={cn(align.header, meta?.headerClassName)}
                    >
                      <div className={cn("flex items-center gap-1", align.content)}>
                        {!canSort ? (
                          label
                        ) : typeof label === "string" || typeof label === "number" ? (
                          // A real button, so the sort is reachable with Tab and
                          // Enter, not only a click on the cell. The heading's
                          // own look: the button only adds the hover and ring.
                          // It wraps like the heading it replaces: a long title
                          // takes a second line rather than an ellipsis.
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={header.column.getToggleSortingHandler()}
                            className={cn(
                              "-mx-1.5 h-auto min-h-6 gap-1 whitespace-normal px-1.5 py-0.5 text-xs font-medium uppercase tracking-wider text-current",
                              align.header,
                            )}
                          >
                            {/* Its own element, so Button leaves it untruncated. */}
                            <span className="min-w-0">{label}</span>
                            {sortIcon}
                          </Button>
                        ) : (
                          // A header the caller rendered may hold its own
                          // control, and a button cannot hold another: the
                          // header stays as given and the sort is a button
                          // beside it.
                          <>
                            {label}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label={`Sort by ${header.column.id}`}
                              onClick={header.column.getToggleSortingHandler()}
                              className="h-6 w-6 text-current"
                            >
                              {sortIcon}
                            </Button>
                          </>
                        )}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row, index) => {
                const canExpand = row.getCanExpand();
                const isExpanded = canExpand && row.getIsExpanded();
                const rowDetailId = `${detailId}-${row.id}`;
                return (
                  <Fragment key={row.id}>
                    <TableRow
                      className={cn(
                        "transition-colors last:border-0",
                        // Zebra, keyed to the row's index within the CURRENT page, so the
                        // banding starts the same way on every page instead of depending on
                        // whether the pages before it held an odd number of rows.
                        //
                        // A plain `bg-*` and not the `even:` variant on purpose: a plain
                        // class is one specificity step below `hover:bg-*`, so the hover
                        // wins whatever order Tailwind emits the two in. `even:` and
                        // `hover:` are both class-plus-pseudo-class and TIE, which would
                        // leave "does hovering a striped row look any different" decided by
                        // the generated stylesheet's ordering.
                        index % 2 === 1 && "bg-table-stripe",
                        onRowClick && "cursor-pointer",
                        // Hover on EVERY row, clickable or not. It answers "which row am I
                        // reading" across a table too wide to track by eye, which is a
                        // reading aid rather than a click affordance — `cursor-pointer`
                        // above is the separate question of whether the row does anything
                        // when you click it.
                        //
                        // Held back while the row is selected: the hover token is a wash
                        // OVER whatever the row sits on rather than a shade of it, so on a
                        // selected row it would cover the selection instead of deepening
                        // it, and the pointer would appear to clear the one row state that
                        // has to stay readable under it.
                        !row.getIsSelected() && tableRowHoverClass,
                        // Last, so twMerge drops the stripe from a selected row: a row gets
                        // one background, and selection is the one that means something.
                        row.getIsSelected() && "bg-accent-muted",
                        // The caller's, last of all, so a row tint or `opacity-60` wins.
                        rowClassName?.(row.original),
                      )}
                      onClick={() => {
                        if (expandOnRowClick && canExpand) row.toggleExpanded();
                        onRowClick?.(row.original);
                      }}
                    >
                      {expandable && (
                        <TableCell className="w-10 px-1 py-1">
                          {canExpand && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label="Show details"
                              aria-expanded={isExpanded}
                              aria-controls={isExpanded ? rowDetailId : undefined}
                              onClick={(e) => {
                                // The toggle is its own action, never a row click.
                                e.stopPropagation();
                                row.toggleExpanded();
                              }}
                            >
                              <ChevronExpand
                                size={14}
                                aria-hidden="true"
                                className={cn("transition-transform", isExpanded && "rotate-90")}
                              />
                            </Button>
                          )}
                        </TableCell>
                      )}
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            "text-text-secondary",
                            cell.column.columnDef.meta?.align &&
                              alignClasses[cell.column.columnDef.meta.align].cell,
                            cell.column.columnDef.meta?.className,
                          )}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                    {isExpanded && (
                      <TableRow
                        id={rowDetailId}
                        className="bg-surface-raised last:border-0"
                      >
                        <TableCell colSpan={colCount} className="px-4 py-3 text-text-secondary">
                          {renderExpanded?.(row.original)}
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })
            ) : (
              <TableEmptyRow colSpan={colCount}>{emptyMessage}</TableEmptyRow>
            )}
          </TableBody>
          {hasFooter && (
            <TableFooter>
              {/* The leaf columns' row only: TanStack lists it first. */}
              {table.getFooterGroups().slice(0, 1).map((footerGroup) => (
                <TableRow key={footerGroup.id}>
                  {expandable && <TableCell className="w-10 px-1" />}
                  {footerGroup.headers.map((header) => {
                    const meta = header.column.columnDef.meta;
                    return (
                      <TableCell
                        key={header.id}
                        colSpan={header.colSpan}
                        className={cn(
                          "font-medium text-text-primary",
                          meta?.align && alignClasses[meta.align].cell,
                          meta?.className,
                        )}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.footer, header.getContext())}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableFooter>
          )}
        </Table>
      </div>

      {paginate && (
        // Renders nothing for a single page.
        <Pagination
          className="px-1 pt-3"
          page={table.getState().pagination.pageIndex + 1}
          totalPages={table.getPageCount()}
          totalItems={table.getFilteredRowModel().rows.length}
          pageSize={table.getState().pagination.pageSize}
          onPageChange={(page) => table.setPageIndex(page - 1)}
        />
      )}
    </div>
  );
}

export { type ColumnDef, type SortingState } from "@tanstack/react-table";
