import type { Meta, StoryObj } from "@storybook/react";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import { Popover, PopoverTrigger, PopoverContent } from "./popover";
import { Button } from "./button";
import { Input } from "./input";

i18n.addResourceBundle(
  "en",
  "popover",
  {
    quickEditRent: "Quick edit rent",
    monthlyRent: "Monthly rent",
    amount: "Amount",
    save: "Save",
    filterCharges: "Filter charges",
    chargeCode: "Charge code",
    chargeCodePlaceholder: "e.g. RENT, LATE, NSF",
    minAmount: "Min amount",
    maxAmount: "Max amount",
    reset: "Reset",
    apply: "Apply",
  },
  true,
  true,
);
i18n.addResourceBundle(
  "es",
  "popover",
  {
    quickEditRent: "Editar renta rápido",
    monthlyRent: "Renta mensual",
    amount: "Importe",
    save: "Guardar",
    filterCharges: "Filtrar cargos",
    chargeCode: "Código de cargo",
    chargeCodePlaceholder: "p. ej. RENT, LATE, NSF",
    minAmount: "Importe mínimo",
    maxAmount: "Importe máximo",
    reset: "Restablecer",
    apply: "Aplicar",
  },
  true,
  true,
);

/**
 * Floating panel anchored to a trigger, built on Radix Popover. Good for small
 * inline editors and filter controls that don't warrant a full dialog.
 */
const meta: Meta = {
  title: "Components/Overlays/Popover",
  tags: ["autodocs"],
};
export default meta;

export const Default: StoryObj = {
  render: () => {
    const { t } = useTranslation("popover");
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">{t("quickEditRent")}</Button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="space-y-3">
            <p className="text-sm font-medium text-text-primary">{t("monthlyRent")}</p>
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-muted">{t("amount")}</label>
              <Input type="number" defaultValue="1850.00" />
            </div>
            <Button className="w-full" size="sm">
              {t("save")}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    );
  },
};

export const FilterPanel: StoryObj = {
  render: () => {
    const { t } = useTranslation("popover");
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">{t("filterCharges")}</Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-80">
          <div className="space-y-3">
            <p className="text-sm font-medium text-text-primary">{t("filterCharges")}</p>
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-muted">{t("chargeCode")}</label>
              <Input placeholder={t("chargeCodePlaceholder")} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-text-muted">{t("minAmount")}</label>
                <Input type="number" placeholder="0.00" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-text-muted">{t("maxAmount")}</label>
                <Input type="number" placeholder="5000.00" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="ghost" size="sm">
                {t("reset")}
              </Button>
              <Button size="sm">{t("apply")}</Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  },
};
