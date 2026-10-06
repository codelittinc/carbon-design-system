import type { Meta, StoryObj } from "@storybook/react";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import { useEffect, useState } from "react";
import { DataTable, type ColumnDef, type SortingState } from "./data-table";
import { Pagination } from "./pagination";
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

/**
 * The server sorts and pages: the table gets one page of rows, reports header
 * clicks through `onSortingChange` (`manualSorting`), and draws no pager of its
 * own (`paginate={false}`) — `Pagination` sits under it. Amounts are
 * right-aligned through column `meta`, and voided charges are dimmed with
 * `rowClassName`. The "server" here is a 300ms timeout over the same rows.
 */
export const ServerSideSortAndPaging: Story = {
  render: () => {
    const PAGE_SIZE = 8;
    const [sorting, setSorting] = useState<SortingState>([{ id: "tenant", desc: false }]);
    const [page, setPage] = useState(1);
    const [rows, setRows] = useState<ChargeRow[]>([]);

    useEffect(() => {
      const timer = setTimeout(() => {
        const [sort] = sorting;
        const sorted = sort
          ? [...data].sort((a, b) => {
              const key = sort.id as keyof ChargeRow;
              const cmp =
                key === "amount"
                  ? Number(a.amount) - Number(b.amount)
                  : String(a[key]).localeCompare(String(b[key]));
              return sort.desc ? -cmp : cmp;
            })
          : data;
        setRows(sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));
      }, 300);
      return () => clearTimeout(timer);
    }, [sorting, page]);

    const columns: ColumnDef<ChargeRow>[] = [
      { accessorKey: "id", header: "Charge ID", meta: { className: "whitespace-nowrap" } },
      { accessorKey: "tenant", header: "Tenant" },
      { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.getValue("status")} /> },
      {
        accessorKey: "amount",
        header: "Amount",
        meta: { align: "right" },
        cell: ({ row }) => (
          <span className="font-mono tabular-nums text-text-primary">${row.getValue("amount")}</span>
        ),
      },
    ];

    return (
      <div className="space-y-3">
        <DataTable
          columns={columns}
          data={rows}
          getRowId={(row) => row.id}
          sorting={sorting}
          onSortingChange={(next) => {
            setSorting(next);
            setPage(1);
          }}
          manualSorting
          paginate={false}
          rowClassName={(row) => (row.status === "VOIDED" ? "opacity-60" : undefined)}
        />
        <Pagination
          page={page}
          totalPages={Math.ceil(data.length / PAGE_SIZE)}
          onPageChange={setPage}
          totalItems={data.length}
          pageSize={PAGE_SIZE}
        />
      </div>
    );
  },
};

type AuditRow = { id: string; when: string; user: string; action: string; changes: [string, string, string][] };

const AUDIT: AuditRow[] = [
  { id: "a1", when: "Sep 30, 14:02", user: "ana@example.com", action: "update", changes: [["status", "draft", "active"], ["owner", "—", "Bruno"]] },
  { id: "a2", when: "Sep 30, 11:47", user: "bruno@example.com", action: "create", changes: [["name", "—", "Globex renewal"]] },
  { id: "a3", when: "Sep 29, 09:15", user: "carla@example.com", action: "delete", changes: [] },
];

/**
 * `renderExpanded` adds a toggle column and shows a detail row under each
 * opened row; `expandOnRowClick` lets the whole row toggle it. Rows with nothing
 * to show are left without a toggle via `getRowCanExpand`.
 */
export const ExpandableRows: Story = {
  render: () => (
    <DataTable
      columns={[
        { accessorKey: "when", header: "Timestamp", meta: { className: "whitespace-nowrap" } },
        { accessorKey: "user", header: "User" },
        { accessorKey: "action", header: "Action" },
      ] as ColumnDef<AuditRow>[]}
      data={AUDIT}
      getRowId={(row) => row.id}
      paginate={false}
      expandOnRowClick
      getRowCanExpand={(row) => row.changes.length > 0}
      renderExpanded={(row) => (
        <table className="text-xs">
          <tbody>
            {row.changes.map(([field, from, to]) => (
              <tr key={field}>
                <th className="pr-4 text-left font-medium text-text-muted">{field}</th>
                <td className="pr-2 text-error-text line-through">{from}</td>
                <td className="text-success-text">{to}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    />
  ),
};

/** A column `footer` (TanStack's own option) adds a footer row, for totals. */
export const WithFooter: Story = {
  render: () => {
    const columns: ColumnDef<{ item: string; amount: number }, unknown>[] = [
      { accessorKey: "item", header: "Item", footer: "Total" },
      {
        accessorKey: "amount",
        header: "Amount",
        meta: { align: "right" },
        cell: ({ getValue }) => `$${getValue<number>().toFixed(2)}`,
        footer: ({ table }) =>
          `$${table
            .getFilteredRowModel()
            .rows.reduce((sum, row) => sum + row.original.amount, 0)
            .toFixed(2)}`,
      },
    ];
    return (
      <DataTable
        columns={columns}
        data={[
          { item: "Design", amount: 1200 },
          { item: "Development", amount: 3400.5 },
          { item: "QA", amount: 800 },
        ]}
      />
    );
  },
};
