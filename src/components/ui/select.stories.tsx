import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "./select";

i18n.addResourceBundle(
  "en",
  "select",
  {
    selectProperty: "Select a property",
    selectChargeCode: "Select a charge code",
    selectLeaseStatus: "Select lease status",
    baseRent: "Base Rent",
    parking: "Parking",
    petRent: "Pet Rent",
    lateFee: "Late Fee",
    nsfFee: "NSF Fee",
    currentResident: "Current Resident",
    onNotice: "On Notice",
    pastResident: "Past Resident",
    selectedLabel: "Selected: {{value}}",
    none: "none",
  },
  true,
  true,
);
i18n.addResourceBundle(
  "es",
  "select",
  {
    selectProperty: "Seleccionar propiedad",
    selectChargeCode: "Seleccionar código de cargo",
    selectLeaseStatus: "Seleccionar estado del contrato",
    baseRent: "Renta base",
    parking: "Estacionamiento",
    petRent: "Renta de mascotas",
    lateFee: "Recargo por mora",
    nsfFee: "Cargo por fondos insuficientes",
    currentResident: "Residente actual",
    onNotice: "En aviso",
    pastResident: "Ex residente",
    selectedLabel: "Seleccionado: {{value}}",
    none: "ninguno",
  },
  true,
  true,
);

/**
 * Select is a Radix-based dropdown for choosing a single option from a known
 * list — picking a property, charge code, or lease status. Composed from
 * Trigger / Value / Content / Item primitives.
 */
const meta: Meta<typeof Select> = {
  title: "Components/Forms/Select",
  component: Select,
  tags: ["autodocs"],
};
export default meta;

export const Default: StoryObj<typeof Select> = {
  render: () => {
    const { t } = useTranslation("select");
    return (
      <Select>
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder={t("selectProperty")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="maple">Maple Court</SelectItem>
          <SelectItem value="oak">Oak Ridge Apartments</SelectItem>
          <SelectItem value="birch">Birch Hollow</SelectItem>
          <SelectItem value="cedar">Cedar Point Lofts</SelectItem>
        </SelectContent>
      </Select>
    );
  },
};

export const WithGroups: StoryObj<typeof Select> = {
  render: () => {
    const { t } = useTranslation("select");
    return (
      <Select>
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder={t("selectChargeCode")} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="rent">{t("baseRent")}</SelectItem>
            <SelectItem value="parking">{t("parking")}</SelectItem>
            <SelectItem value="pet">{t("petRent")}</SelectItem>
          </SelectGroup>
          <SelectGroup>
            <SelectItem value="late">{t("lateFee")}</SelectItem>
            <SelectItem value="nsf">{t("nsfFee")}</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    );
  },
};

export const Controlled: StoryObj<typeof Select> = {
  render: () => {
    const { t } = useTranslation("select");
    const [value, setValue] = useState<string>("");
    return (
      <div className="flex flex-col gap-2">
        <Select value={value} onValueChange={setValue}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder={t("selectLeaseStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current">{t("currentResident")}</SelectItem>
            <SelectItem value="notice">{t("onNotice")}</SelectItem>
            <SelectItem value="past">{t("pastResident")}</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-text-muted">
          {t("selectedLabel", { value: value || t("none") })}
        </p>
      </div>
    );
  },
};

export const Disabled: StoryObj<typeof Select> = {
  render: () => {
    const { t } = useTranslation("select");
    return (
      <Select>
        <SelectTrigger className="w-[220px]" disabled>
          <SelectValue placeholder={t("selectProperty")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="maple">Maple Court</SelectItem>
        </SelectContent>
      </Select>
    );
  },
};

/** An item may have `value=""`: an "All" or "None" choice without a sentinel. */
export const EmptyValueItem: StoryObj<typeof Select> = {
  render: () => {
    const [status, setStatus] = useState("");
    return (
      <div className="w-56 space-y-2">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger aria-label="Status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-text-muted">value: {JSON.stringify(status)}</p>
      </div>
    );
  },
};
