import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "./card";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "./table";

/**
 * The table elements `DataTable` is built from. Use them directly for a table
 * DataTable does not fit, such as a short summary inside a Card.
 */
const meta: Meta<typeof Table> = {
  title: "Components/Data Display/Table",
  component: Table,
  tags: ["autodocs"],
};
export default meta;

const ROWS = [
  { project: "Backstage", hours: 32 },
  { project: "Carbon", hours: 6 },
  { project: "Gatekeeper", hours: 2 },
];

export const Default: StoryObj = {
  render: () => (
    <Card padding="sm" className="max-w-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project</TableHead>
            <TableHead className="text-right">Hours</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ROWS.map((row) => (
            <TableRow key={row.project} className="hover:bg-table-row-hover">
              <TableCell className="text-text-primary">{row.project}</TableCell>
              <TableCell className="text-right tabular-nums">{row.hours}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell className="text-xs font-medium uppercase text-text-muted">Total</TableCell>
            <TableCell className="text-right font-semibold tabular-nums">40</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </Card>
  ),
};
