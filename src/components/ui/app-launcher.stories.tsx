import type { Meta, StoryObj } from "@storybook/react";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import { AppLauncher, type AppLauncherProps, type AppLauncherSection } from "./app-launcher";

i18n.addResourceBundle(
  "en",
  "appLauncher",
  {
    carbonOS: "CarbonOS",
    tools: "Tools",
    label: "Carbon apps",
    current: "Current",
    unavailable: "Link unavailable",
    newTab: " (opens in a new tab)",
    more: "All your tools",
    emptyTitle: "No apps to show yet",
    emptyDescription: "Apps and tools you have access to show up here once IT gives you access.",
    notice: "Some app links couldn't load. Try again later.",
  },
  true,
  true,
);
i18n.addResourceBundle(
  "es",
  "appLauncher",
  {
    carbonOS: "CarbonOS",
    tools: "Herramientas",
    label: "Apps de Carbon",
    current: "Actual",
    unavailable: "Enlace no disponible",
    newTab: " (se abre en una pestaña nueva)",
    more: "Todas tus herramientas",
    emptyTitle: "Aún no hay apps",
    emptyDescription: "Las apps y herramientas a las que tienes acceso aparecen aquí cuando IT te da acceso.",
    notice: "Algunos enlaces no se pudieron cargar. Inténtalo más tarde.",
  },
  true,
  true,
);

const CARBON_OS = [
  { name: "Player Scoreboard", href: "https://scoreboard.example.com", current: true },
  { name: "Backbone", href: "https://backbone.example.com" },
  { name: "Gatekeeper", href: "https://gatekeeper.example.com" },
  { name: "Atlas", href: "https://atlas.example.com" },
  { name: "ACP", href: "https://acp.example.com" },
];

const TOOLS = [
  { name: "Yardi", href: "https://yardi.example.com" },
  { name: "Slack", href: "https://slack.example.com" },
  { name: "Notion", href: "https://notion.example.com" },
];

/**
 * The launcher with the story's copy in the toolbar's language. App names are
 * data, so they stay as they are.
 */
function Launcher({
  sections,
  withNotice = false,
  ...props
}: Omit<AppLauncherProps, "sections" | "notice"> & {
  sections: (t: (key: string) => string) => AppLauncherSection[];
  withNotice?: boolean;
}) {
  const { t } = useTranslation("appLauncher");
  return (
    <div className="flex justify-end">
      <AppLauncher
        sections={sections(t)}
        label={t("label")}
        currentLabel={t("current")}
        unavailableLabel={t("unavailable")}
        newTabLabel={t("newTab")}
        moreLabel={t("more")}
        emptyTitle={t("emptyTitle")}
        emptyDescription={t("emptyDescription")}
        notice={withNotice ? t("notice") : undefined}
        {...props}
      />
    </div>
  );
}

/**
 * The grid-icon button in an app's header that lists the apps and tools a
 * person can open. Links open in a new tab; the current app is highlighted and
 * an app without a link is shown as text. Click the button to open it.
 */
const meta: Meta = {
  title: "Components/Navigation/AppLauncher",
  component: AppLauncher,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Launcher
      moreHref="https://gatekeeper.example.com/me"
      sections={(t) => [
        { heading: t("carbonOS"), apps: CARBON_OS },
        { heading: t("tools"), apps: TOOLS },
      ]}
    />
  ),
};

/** About 80 apps: the list scrolls under a fixed footer. */
export const ManyApps: Story = {
  render: () => (
    <Launcher
      moreHref="https://gatekeeper.example.com/me"
      sections={(t) => [
        { heading: t("carbonOS"), apps: CARBON_OS },
        {
          heading: t("tools"),
          apps: Array.from({ length: 75 }, (_, i) => ({
            name: `Tool ${String(i + 1).padStart(2, "0")}`,
            href: `https://tool-${i + 1}.example.com`,
          })),
        },
      ]}
    />
  ),
};

export const OnlyCarbonOS: Story = {
  render: () => <Launcher sections={(t) => [{ heading: t("carbonOS"), apps: CARBON_OS }]} />,
};

/** Links that could not load: the names stay, with the notice above them. */
export const Unavailable: Story = {
  render: () => (
    <Launcher
      withNotice
      sections={(t) => [
        {
          heading: t("carbonOS"),
          apps: CARBON_OS.map((app) => (app.current ? app : { ...app, href: null })),
        },
        { heading: t("tools"), apps: TOOLS.map((app) => ({ ...app, href: null })) },
      ]}
    />
  ),
};

export const Empty: Story = {
  render: () => <Launcher sections={(t) => [{ heading: t("carbonOS"), apps: [] }, { heading: t("tools"), apps: [] }]} />,
};

/** Long names wrap onto more lines; none is cut off. */
export const LongNames: Story = {
  render: () => (
    <Launcher
      sections={(t) => [
        {
          heading: t("carbonOS"),
          apps: [
            { name: "Player Scoreboard", href: "https://scoreboard.example.com", current: true },
            { name: "Delinquency Center and Collections Workbench", href: "https://delinquency.example.com" },
            { name: "Applicant Packet Screening Review", href: "https://acp.example.com" },
          ],
        },
        {
          heading: t("tools"),
          apps: [{ name: "Yardi Voyager Property Management (Residential)", href: null }],
        },
      ]}
    />
  ),
};

export const Dark: Story = {
  ...Default,
  parameters: { themes: { themeOverride: "dark" } },
};
