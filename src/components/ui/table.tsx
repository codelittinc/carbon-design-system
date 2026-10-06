import { forwardRef } from "react";
import { cn } from "@/lib/cn";
import { eyebrowClass } from "@/lib/ui-classes";

/**
 * The table elements, styled once. `DataTable` is built from these; use them
 * directly for a table `DataTable` does not fit — an editable grid, a short
 * summary inside a `Card`. Every part takes `className`, merged last, so a
 * cell's padding or alignment can be overridden in place.
 */
const Table = forwardRef<HTMLTableElement, React.TableHTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <table ref={ref} className={cn("w-full text-sm", className)} {...props} />
  ),
);
Table.displayName = "Table";

/** The heading rows. Their bottom border is the full `border` token, not the subtle one. */
const TableHeader = forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={cn("[&_tr]:border-border", className)} {...props} />
  ),
);
TableHeader.displayName = "TableHeader";

const TableBody = forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  (props, ref) => <tbody ref={ref} {...props} />,
);
TableBody.displayName = "TableBody";

/** Totals. A heavier rule above sets them off from the body. */
const TableFooter = forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tfoot ref={ref} className={cn("[&_tr]:border-b-0 [&_tr]:border-t-2 [&_tr]:border-border", className)} {...props} />
  ),
);
TableFooter.displayName = "TableFooter";

const TableRow = forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr ref={ref} className={cn("border-b border-border-subtle", className)} {...props} />
  ),
);
TableRow.displayName = "TableRow";

const TableHead = forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(eyebrowClass, "px-3 py-2 text-left", className)}
      {...props}
    />
  ),
);
TableHead.displayName = "TableHead";

const TableCell = forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => <td ref={ref} className={cn("px-3 py-2", className)} {...props} />,
);
TableCell.displayName = "TableCell";

export { Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell };
