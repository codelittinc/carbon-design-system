import type { Meta, StoryObj } from "@storybook/react";
import { Download, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import { PageHeader } from "./page-header";
import { Button } from "./button";

i18n.addResourceBundle(
  "en",
  "pageHeader",
  {
    tenantsTitle: "Tenants",
    tenantsDescription:
      "All current, past, and applicant residents across your portfolio.",
    leasesTitle: "Leases",
    leasesDescription: "Active and pending lease agreements by property.",
    export: "Export",
    newLease: "New Lease",
  },
  true,
  true,
);
i18n.addResourceBundle(
  "es",
  "pageHeader",
  {
    tenantsTitle: "Inquilinos",
    tenantsDescription:
      "Todos los residentes actuales, anteriores y solicitantes de tu portafolio.",
    leasesTitle: "Contratos",
    leasesDescription: "Contratos activos y pendientes por propiedad.",
    export: "Exportar",
    newLease: "Nuevo contrato",
  },
  true,
  true,
);

/**
 * PageHeader renders a page title (in the display font) with an optional
 * description and a right-aligned actions slot. Used at the top of dashboard
 * sections like Tenants, Leases, and Reports.
 */
const meta: Meta<typeof PageHeader> = {
  title: "Components/Data Display/PageHeader",
  component: PageHeader,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof PageHeader>;

export const Default: Story = {
  render: () => {
    const { t } = useTranslation("pageHeader");
    return (
      <PageHeader
        title={t("tenantsTitle")}
        description={t("tenantsDescription")}
      />
    );
  },
};

export const WithActions: Story = {
  render: () => {
    const { t } = useTranslation("pageHeader");
    return (
      <PageHeader
        title={t("leasesTitle")}
        description={t("leasesDescription")}
        actions={
          <>
            <Button variant="outline">
              <Download size={14} />
              {t("export")}
            </Button>
            <Button>
              <Plus size={14} />
              {t("newLease")}
            </Button>
          </>
        }
      />
    );
  },
};

/** `back` links to the page above. Pass `as` (Next's Link, say) for client-side routing. */
export const WithBackLink: StoryObj<typeof PageHeader> = {
  render: () => (
    <PageHeader
      title="Contract #1042"
      description="Acme Corp · Retainer"
      back={{ href: "#", label: "Contracts" }}
      actions={<Button>Edit</Button>}
    />
  ),
};
