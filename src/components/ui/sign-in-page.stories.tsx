import type { Meta, StoryObj } from "@storybook/react";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import { SignInPage, type SignInPageCopy } from "./sign-in-page";
import { ThemeProvider } from "./theme";

const spanish: SignInPageCopy = {
  welcome: "CONTINUAR A {{appName}}",
  title: "Te damos la bienvenida.",
  description: "Inicia sesión con tu cuenta de trabajo de Carbon para continuar a {{appName}}.",
  button: "Continuar con Google",
  loading: "Preparando el inicio de sesión…",
  pending: "Conectando con Google…",
  unavailable: "El inicio de sesión no está disponible. Inténtalo más tarde.",
  help: "¿Necesitas acceso o ayuda para iniciar sesión? Contacta a tu administrador.",
  footnote: "Tu cuenta de trabajo. Tu espacio conectado.",
  footer: "Creado para tu equipo.",
};
i18n.addResourceBundle("es", "signInPage", spanish, true, true);
i18n.addResourceBundle("en", "signInPage", { error: "We couldn’t connect. Please try again." }, true, true);
i18n.addResourceBundle("es", "signInPage", { error: "No pudimos conectarnos. Inténtalo de nuevo." }, true, true);

const meta: Meta<typeof SignInPage> = {
  title: "Pages/SignInPage",
  component: SignInPage,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: { appName: "CarbonOS", status: "ready", showThemeToggle: false },
  argTypes: { onSignIn: { action: "signIn" } },
  render: function Example(args) {
    const { t, i18n: language } = useTranslation("signInPage");
    const copy = language.language.startsWith("es")
      ? Object.fromEntries(Object.keys(spanish).map((key) => [key, t(key, { appName: args.appName ?? "CarbonOS" })]))
      : undefined;
    return <SignInPage {...args} copy={copy} error={args.error ? t("error") : undefined} />;
  },
};
export default meta;
type Story = StoryObj<typeof SignInPage>;

export const CarbonOS: Story = {};
export const Gatekeeper: Story = { args: { appName: "Gatekeeper" } };
export const Reimbursements: Story = { args: { appName: "Reimbursements" } };
export const Loading: Story = { args: { status: "loading" } };
export const Connecting: Story = { args: { status: "pending" } };
export const Retry: Story = { args: { error: "retry" } };
export const Unavailable: Story = { args: { status: "unavailable" } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: "mobile1" } } };
export const ThemeControl: Story = {
  args: { showThemeToggle: true },
  decorators: [(Story) => <ThemeProvider><Story /></ThemeProvider>],
};
