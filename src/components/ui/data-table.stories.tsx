import type { Meta, StoryObj } from "@storybook/react";
import { DataTable, type ColumnDef } from "./data-table";
import { StatusBadge } from "./status-badge";

/**
 * DataTable is a TanStack-backed table with sorting, pagination, optional row
 * selection, and an empty state. Below it drives a tenant charge ledger with a
 * status column (StatusBadge) and a right-aligned money column.
 */
const meta: Meta<typeof DataTable> = {
  title: "Components/DataTable",
  component: DataTable,
  tags: ["autodocs"],
};
export default meta;

type ChargeRow = {
  id: string;
  tenant: string;
  unit: string;
  chargeCode: string;
  status: string;
  amount: string;
};

const TENANTS = [
  "Ava Thompson",
  "Marcus Lee",
  "Priya Nair",
  "Diego Ramirez",
  "Sophie Müller",
  "Jamal Carter",
];
const CHARGE_CODES = ["RENT", "LATE_FEE", "UTILITIES", "PARKING", "PET_RENT"];
const STATUSES = ["PAID", "PARTIALLY_PAID", "PENDING", "VOIDED", "POSTED"];

const data: ChargeRow[] = Array.from({ length: 30 }, (_, i) => {
  const amount = (1200 + i * 37.5).toFixed(2);
  return {
    id: `chg_${(i + 1).toString().padStart(4, "0")}`,
    tenant: TENANTS[i % TENANTS.length],
    unit: `${100 + (i % 6)}${String.fromCharCode(65 + (i % 4))}`,
    chargeCode: CHARGE_CODES[i % CHARGE_CODES.length],
    status: STATUSES[i % STATUSES.length],
    amount,
  };
});

const columns: ColumnDef<ChargeRow>[] = [
  { accessorKey: "id", header: "Charge ID" },
  { accessorKey: "tenant", header: "Tenant" },
  { accessorKey: "unit", header: "Unit" },
  { accessorKey: "chargeCode", header: "Charge Code" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <span className="font-mono tabular-nums text-text-primary">
        ${row.getValue("amount")}
      </span>
    ),
  },
];

type Story = StoryObj<typeof DataTable<ChargeRow, unknown>>;

export const Default: Story = {
  render: () => <DataTable columns={columns} data={data} />,
};

export const WithRowSelection: Story = {
  render: () => <DataTable columns={columns} data={data} enableSelection />,
};

export const Empty: Story = {
  render: () => (
    <DataTable
      columns={columns}
      data={[]}
      emptyMessage="No charges posted for this period."
    />
  ),
};

export const SmallPageSize: Story = {
  render: () => <DataTable columns={columns} data={data} pageSize={5} />,
};
