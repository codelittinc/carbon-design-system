"use client";

import {
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type RowSelectionState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useRef, useState } from "react";
import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "./button";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRowClick?: (row: TData) => void;
  pageSize?: number;
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
}

/** Distinguishes "prop omitted" from any value a caller could legitimately pass. */
const UNSET = Symbol("DataTable.resetPageOn.unset");

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
  pageSize = 25,
  enableSelection = false,
  emptyMessage = "No results.",
  resetPageOn = UNSET,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const driven = resetPageOn !== UNSET;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: enableSelection,
    // Hand the reset over to the effect below only when the caller opted in, so the
    // default stays exactly TanStack's.
    autoResetPageIndex: !driven,
    state: { sorting, columnFilters, rowSelection },
    initialState: { pagination: { pageSize } },
  });

  // Mount already starts on page 1, so only *changes* to the signature reset.
  const seen = useRef(resetPageOn);
  useEffect(() => {
    if (!driven || Object.is(seen.current, resetPageOn)) return;
    seen.current = resetPageOn;
    table.setPageIndex(0);
  }, [driven, resetPageOn, table]);

  return (
    <div>
      <div className="rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-border">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={cn(
                      "px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-text-muted",
                      header.column.getCanSort() && "cursor-pointer select-none",
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <ArrowUpDown size={12} className="text-text-faint" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    "border-b border-border-subtle transition-colors last:border-0",
                    onRowClick && "cursor-pointer hover:bg-surface-overlay",
                    row.getIsSelected() && "bg-accent-muted",
                  )}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2 text-text-secondary">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-3 py-8 text-center text-text-muted">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between px-1 pt-3">
          <span className="text-xs text-text-muted">
            {table.getFilteredRowModel().rows.length} row(s)
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft size={14} />
            </Button>
            <span className="px-2 text-xs text-text-secondary">
              {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export { type ColumnDef } from "@tanstack/react-table";
