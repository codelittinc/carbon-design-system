import { useEffect } from "react";
import type { Preview } from "@storybook/react";
import { withThemeByClassName } from "@storybook/addon-themes";
import { I18nextProvider } from "react-i18next";
import i18n from "../src/i18n";
import "../src/styles/theme.css";

/*
 * Two global controls live in the toolbar:
 *
 * - Theme  → toggles `.dark` / `.light` on <html>; theme.css tokens do the rest.
 * - Language → switches example copy between English and Spanish. Stories register
 *   their own strings with i18n.addResourceBundle and read them via useTranslation.
 *
 * The canvas background follows --color-bg, so the backgrounds addon is disabled.
 */

function I18nProvider({ locale, children }: { locale: string; children: React.ReactNode }) {
  useEffect(() => {
    if (i18n.language !== locale) i18n.changeLanguage(locale);
  }, [locale]);
  // Set eagerly too so the first render already reflects the chosen language.
  if (i18n.language !== locale) i18n.changeLanguage(locale);
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

const preview: Preview = {
  initialGlobals: {
    locale: "en",
  },
  globalTypes: {
    locale: {
      description: "Language for example text",
      toolbar: {
        title: "Language",
        icon: "globe",
        items: [
          { value: "en", title: "English", right: "EN" },
          { value: "es", title: "Español", right: "ES" },
        ],
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    backgrounds: { disable: true },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: [
          "Introduction",
          "Foundations",
          ["Colors", "Typography", "Spacing", "Radius"],
          "Components",
          ["Forms", "Overlays", "Data Display"],
        ],
      },
    },
  },
  decorators: [
    (Story, context) => (
      <I18nProvider locale={context.globals.locale}>
        <Story />
      </I18nProvider>
    ),
    withThemeByClassName({
      themes: { dark: "dark", light: "light" },
      defaultTheme: "dark",
      parentSelector: "html",
    }),
    (Story) => (
      <div className="min-h-screen bg-bg p-6 font-body text-text-primary antialiased">
        <Story />
      </div>
    ),
  ],
};

export default preview;
