import type { Meta, StoryObj } from "@storybook/react";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import { ThemeProvider, ThemeToggle, useTheme } from "./theme";

i18n.addResourceBundle(
  "en",
  "theme",
  {
    activeTheme: "Active theme: {{theme}}",
    hint: "Click the icon to toggle. The choice persists to localStorage and applies before paint on reload.",
    surface: "Surface",
    raised: "Raised card",
    accent: "Accent",
    muted: "Muted text",
  },
  true,
  true,
);
i18n.addResourceBundle(
  "es",
  "theme",
  {
    activeTheme: "Tema activo: {{theme}}",
    hint: "Haz clic en el icono para alternar. La elección se guarda en localStorage y se aplica antes del renderizado al recargar.",
    surface: "Superficie",
    raised: "Tarjeta elevada",
    accent: "Acento",
    muted: "Texto atenuado",
  },
  true,
  true,
);

/**
 * Light/dark theme control. Wrap the app once in `ThemeProvider`, inject
 * `THEME_SCRIPT` into `<head>` to apply the saved theme before first paint, then
 * drop `<ThemeToggle />` anywhere (e.g. a navbar). The provider toggles the
 * `light`/`dark` class on `<html>` and persists the choice to localStorage.
 */
const meta: Meta = {
  title: "Components/Overlays/Theme",
  tags: ["autodocs"],
};
export default meta;

function ThemeDemo() {
  const { t } = useTranslation("theme");
  const { theme } = useTheme();
  return (
    <div className="flex flex-col gap-4 bg-bg p-6">
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <span className="text-sm text-text-primary">
          {t("activeTheme", { theme })}
        </span>
      </div>
      <p className="max-w-sm text-xs text-text-muted">{t("hint")}</p>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-md border border-border bg-surface p-3 text-sm text-text-primary">
          {t("surface")}
        </div>
        <div className="rounded-md border border-border bg-surface-raised p-3 text-sm text-text-primary">
          {t("raised")}
        </div>
        <div className="rounded-md bg-accent p-3 text-sm text-carbon-950">
          {t("accent")}
        </div>
        <div className="rounded-md border border-border bg-surface p-3 text-sm text-text-muted">
          {t("muted")}
        </div>
      </div>
    </div>
  );
}

export const Default: StoryObj = {
  render: () => (
    <ThemeProvider>
      <ThemeDemo />
    </ThemeProvider>
  ),
};
