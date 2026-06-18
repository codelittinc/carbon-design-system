import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import { AddressAutocomplete } from "./address-autocomplete";

i18n.addResourceBundle(
  "en",
  "addressAutocomplete",
  {
    propertyAddress: "Property address",
    startTyping: "Start typing an address…",
    publicForm: "Public application form",
    note: "Live Google Places suggestions require a VITE_GOOGLE_MAPS_API_KEY. Without it, this degrades to a styled text input.",
    current: "Current value:",
    empty: "(empty)",
  },
  true,
  true,
);
i18n.addResourceBundle(
  "es",
  "addressAutocomplete",
  {
    propertyAddress: "Dirección de la propiedad",
    startTyping: "Empieza a escribir una dirección…",
    publicForm: "Formulario de solicitud público",
    note: "Las sugerencias de Google Places requieren una VITE_GOOGLE_MAPS_API_KEY. Sin ella, se muestra como un campo de texto con estilo.",
    current: "Valor actual:",
    empty: "(vacío)",
  },
  true,
  true,
);

/**
 * AddressAutocomplete is a controlled text input that, when a Google Maps API key is
 * present (VITE_GOOGLE_MAPS_API_KEY), upgrades into a Google Places address picker
 * restricted to US addresses. With no key it gracefully renders as a normal styled
 * input — which is what you see in Storybook unless a key is configured.
 *
 * The `staff` variant uses semantic theme tokens (adapts to dark/light); the `public`
 * variant is a fixed dark style for the unauthenticated application form.
 */
const meta: Meta<typeof AddressAutocomplete> = {
  title: "Components/Forms/AddressAutocomplete",
  component: AddressAutocomplete,
  tags: ["autodocs"],
};
export default meta;

export const Default: StoryObj<typeof AddressAutocomplete> = {
  render: () => {
    const { t } = useTranslation("addressAutocomplete");
    const [value, setValue] = useState("");
    return (
      <div className="w-80 space-y-3">
        <label className="block text-xs font-medium text-text-secondary">
          {t("propertyAddress")}
        </label>
        <AddressAutocomplete value={value} onChange={setValue} placeholder={t("startTyping")} />
        <p className="text-xs text-text-muted">
          {t("current")} <span className="text-text-primary">{value || t("empty")}</span>
        </p>
        <p className="max-w-xs text-[11px] leading-snug text-text-faint">{t("note")}</p>
      </div>
    );
  },
};

export const WithValue: StoryObj<typeof AddressAutocomplete> = {
  render: () => {
    const { t } = useTranslation("addressAutocomplete");
    const [value, setValue] = useState("1600 Amphitheatre Pkwy, Mountain View, CA 94043");
    return (
      <div className="w-80">
        <AddressAutocomplete value={value} onChange={setValue} placeholder={t("startTyping")} />
      </div>
    );
  },
};

export const PublicVariant: StoryObj<typeof AddressAutocomplete> = {
  render: () => {
    const { t } = useTranslation("addressAutocomplete");
    const [value, setValue] = useState("");
    return (
      <div className="w-80 space-y-2">
        <label className="block text-xs font-medium text-gray-400">{t("publicForm")}</label>
        <AddressAutocomplete
          value={value}
          onChange={setValue}
          variant="public"
          placeholder={t("startTyping")}
        />
      </div>
    );
  },
};
