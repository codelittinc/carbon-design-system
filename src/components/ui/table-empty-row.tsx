/**
 * The one row a table body shows when it has nothing in it. Internal: used by
 * `DataTable` and the timesheet tables, not exported.
 */

import type { ReactElement, ReactNode } from "react";
import { TableCell, TableRow } from "./table";

export function TableEmptyRow({
  colSpan,
  children,
}: {
  /** Every column, so the message spans the table. */
  colSpan: number;
  children: ReactNode;
}): ReactElement {
  return (
    <TableRow className="border-0">
      <TableCell colSpan={colSpan} className="py-8 text-center text-text-muted">
        {children}
      </TableCell>
    </TableRow>
  );
}
