import type { Meta, StoryObj } from "@storybook/react";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import { DataTable, type ColumnDef } from "./data-table";
import { StatusBadge } from "./status-badge";

i18n.addResourceBundle(
  "en",
  "dataTable",
  {
    chargeId: "Charge ID",
    tenant: "Tenant",
    unit: "Unit",
    chargeCode: "Charge Code",
    status: "Status",
    amount: "Amount",
    emptyMessage: "No charges posted for this period.",
  },
  true,
  true,
);
i18n.addResourceBundle(
  "es",
  "dataTable",
  {
    chargeId: "ID de cargo",
    tenant: "Inquilino",
    unit: "Unidad",
    chargeCode: "Código de cargo",
    status: "Estado",
    amount: "Importe",
    emptyMessage: "No hay cargos registrados para este período.",
  },
  true,
  true,
);

/**
 * DataTable is a TanStack-backed table with sorting, pagination, optional row
 * selection, and an empty state. Below it drives a tenant charge ledger with a
 * status column (StatusBadge) and a right-aligned money column.
 */
const meta: Meta<typeof DataTable> = {
  title: "Components/Data Display/DataTable",
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

function makeColumns(t: TFunction): ColumnDef<ChargeRow>[] {
  return [
    { accessorKey: "id", header: t("chargeId") },
    { accessorKey: "tenant", header: t("tenant") },
    { accessorKey: "unit", header: t("unit") },
    { accessorKey: "chargeCode", header: t("chargeCode") },
    {
      accessorKey: "status",
      header: t("status"),
      cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
    },
    {
      accessorKey: "amount",
      header: t("amount"),
      cell: ({ row }) => (
        <span className="font-mono tabular-nums text-text-primary">
          ${row.getValue("amount")}
        </span>
      ),
    },
  ];
}

type Story = StoryObj<typeof DataTable<ChargeRow, unknown>>;

export const Default: Story = {
  render: () => {
    const { t } = useTranslation("dataTable");
    return <DataTable columns={makeColumns(t)} data={data} />;
  },
};

export const WithRowSelection: Story = {
  render: () => {
    const { t } = useTranslation("dataTable");
    return <DataTable columns={makeColumns(t)} data={data} enableSelection />;
  },
};

export const Empty: Story = {
  render: () => {
    const { t } = useTranslation("dataTable");
    return (
      <DataTable
        columns={makeColumns(t)}
        data={[]}
        emptyMessage={t("emptyMessage")}
      />
    );
  },
};

export const SmallPageSize: Story = {
  render: () => {
    const { t } = useTranslation("dataTable");
    return <DataTable columns={makeColumns(t)} data={data} pageSize={5} />;
  },
};

/**
 * Every row hovers, whether or not it goes anywhere. `onRowClick` adds the
 * pointer cursor on top — that is the click affordance; the hover tint is the
 * reading aid, and a read-only table wants it just as much.
 */
export const Clickable: Story = {
  render: () => {
    const { t } = useTranslation("dataTable");
    return (
      <DataTable columns={makeColumns(t)} data={data} onRowClick={() => {}} />
    );
  },
};

/**
 * The stripe and the hover are translucent washes, so they read on whatever the
 * consumer put behind the table. Toggle the theme on this story: in light mode
 * `surface` and `surface-raised` are both white, which is why neither could be
 * spent as an opaque stripe.
 */
export const OnFilledSurfaces: Story = {
  render: () => {
    const { t } = useTranslation("dataTable");
    return (
      <div className="space-y-6">
        {(["bg-bg", "bg-surface", "bg-surface-raised"] as const).map((ground) => (
          <div key={ground} className={`${ground} rounded-lg p-4`}>
            <p className="mb-2 text-xs uppercase tracking-wider text-text-muted">
              {ground}
            </p>
            <DataTable columns={makeColumns(t)} data={data} pageSize={5} />
          </div>
        ))}
      </div>
    );
  },
};
