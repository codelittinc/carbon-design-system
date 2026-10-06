import type { Meta, StoryObj } from "@storybook/react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Trash2 } from "lucide-react";
import i18n from "../../i18n";
import { Button } from "./button";

i18n.addResourceBundle(
  "en",
  "button",
  {
    postCharge: "Post Charge",
    newLease: "New Lease",
    approveApplication: "Approve Application",
    posting: "Posting…",
    searchTenants: "Search tenants",
    deleteCharge: "Delete charge",
  },
  true,
  true,
);
i18n.addResourceBundle(
  "es",
  "button",
  {
    postCharge: "Registrar cargo",
    newLease: "Nuevo contrato",
    approveApplication: "Aprobar solicitud",
    posting: "Registrando…",
    searchTenants: "Buscar inquilinos",
    deleteCharge: "Eliminar cargo",
  },
  true,
  true,
);

/**
 * Button is the primary action trigger across the product — posting charges,
 * approving applications, saving leases. It supports five visual variants and
 * four sizes (including an icon-only size) via class-variance-authority.
 */
const meta: Meta<typeof Button> = {
  title: "Components/Forms/Button",
  component: Button,
  tags: ["autodocs"],
};
export default meta;

const variants = ["default", "destructive", "outline", "ghost", "link"] as const;
const sizes = ["sm", "default", "lg", "icon"] as const;

export const Default: StoryObj<typeof Button> = {
  render: () => {
    const { t } = useTranslation("button");
    return <Button>{t("postCharge")}</Button>;
  },
};

export const AllVariants: StoryObj<typeof Button> = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      {variants.map((variant) => (
        <Button key={variant} variant={variant}>
          {variant}
        </Button>
      ))}
    </div>
  ),
};

export const Sizes: StoryObj<typeof Button> = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      {sizes.map((size) => (
        <Button key={size} size={size} aria-label={size}>
          {size === "icon" ? <Plus size={16} /> : size}
        </Button>
      ))}
    </div>
  ),
};

export const WithIcon: StoryObj<typeof Button> = {
  render: () => {
    const { t } = useTranslation("button");
    return (
      <Button>
        <Plus size={16} />
        {t("newLease")}
      </Button>
    );
  },
};

export const IconOnly: StoryObj<typeof Button> = {
  render: () => {
    const { t } = useTranslation("button");
    return (
      <div className="flex items-center gap-3">
        <Button size="icon" variant="outline" aria-label={t("searchTenants")}>
          <Search size={16} />
        </Button>
        <Button size="icon" variant="destructive" aria-label={t("deleteCharge")}>
          <Trash2 size={16} />
        </Button>
      </div>
    );
  },
};

export const Disabled: StoryObj<typeof Button> = {
  render: () => {
    const { t } = useTranslation("button");
    return <Button disabled>{t("approveApplication")}</Button>;
  },
};

/**
 * There is no built-in loading prop — convey a pending state by disabling the
 * button and swapping the label, the convention used in the product's forms.
 */
export const Loading: StoryObj<typeof Button> = {
  render: () => {
    const { t } = useTranslation("button");
    return (
      <Button disabled>
        <Search size={16} className="animate-pulse" />
        {t("posting")}
      </Button>
    );
  },
};

/** `tone="destructive"` on outline, ghost or link: a quiet delete beside other actions. */
export const DestructiveTone: StoryObj<typeof Button> = {
  render: () => (
    <div className="flex items-center gap-2">
      <Button variant="destructive">Delete</Button>
      <Button variant="outline" tone="destructive">
        Delete
      </Button>
      <Button variant="ghost" tone="destructive">
        <Trash2 size={14} />
        Remove
      </Button>
      <Button variant="link" tone="destructive">
        Remove link
      </Button>
    </div>
  ),
};
