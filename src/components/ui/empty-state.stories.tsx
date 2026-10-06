import type { Meta, StoryObj } from "@storybook/react";
import { FileText, Inbox, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import { EmptyState } from "./empty-state";
import { Button } from "./button";

i18n.addResourceBundle(
  "en",
  "emptyState",
  {
    noChargesTitle: "No charges posted",
    noChargesDescription:
      "Recurring charges for this period have not been generated yet.",
    inboxZeroTitle: "Inbox zero",
    inboxZeroDescription:
      "There are no pending applications awaiting your review.",
    noLeasesTitle: "No leases yet",
    noLeasesDescription:
      "Create a lease to move an approved applicant into a unit.",
    newLease: "New Lease",
  },
  true,
  true,
);
i18n.addResourceBundle(
  "es",
  "emptyState",
  {
    noChargesTitle: "No hay cargos registrados",
    noChargesDescription:
      "Aún no se han generado los cargos recurrentes de este período.",
    inboxZeroTitle: "Bandeja vacía",
    inboxZeroDescription:
      "No hay solicitudes pendientes a la espera de tu revisión.",
    noLeasesTitle: "Aún no hay contratos",
    noLeasesDescription:
      "Crea un contrato para mudar a un solicitante aprobado a una unidad.",
    newLease: "Nuevo contrato",
  },
  true,
  true,
);

/**
 * EmptyState is a centered placeholder for empty lists and zero-result views.
 * Supports an optional icon, description, and action node (typically a Button).
 */
const meta: Meta<typeof EmptyState> = {
  title: "Components/Data Display/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  render: () => {
    const { t } = useTranslation("emptyState");
    return (
      <EmptyState
        title={t("noChargesTitle")}
        description={t("noChargesDescription")}
      />
    );
  },
};

export const WithIcon: Story = {
  render: () => {
    const { t } = useTranslation("emptyState");
    return (
      <EmptyState
        icon={<Inbox size={40} strokeWidth={1.5} />}
        title={t("inboxZeroTitle")}
        description={t("inboxZeroDescription")}
      />
    );
  },
};

export const WithAction: Story = {
  render: () => {
    const { t } = useTranslation("emptyState");
    return (
      <EmptyState
        icon={<FileText size={40} strokeWidth={1.5} />}
        title={t("noLeasesTitle")}
        description={t("noLeasesDescription")}
        action={
          <Button>
            <Plus size={14} />
            {t("newLease")}
          </Button>
        }
      />
    );
  },
};

/** `as="h1"` when the empty state is the whole page. */
export const AsPageHeading: Story = {
  render: () => (
    <EmptyState as="h1" title="Access denied" description="Ask an admin for access to this page." />
  ),
};
