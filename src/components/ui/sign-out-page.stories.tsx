import type { Meta, StoryObj } from "@storybook/react";
import { SignOutPage } from "./sign-out-page";
import { ThemeProvider } from "./theme";

const meta: Meta<typeof SignOutPage> = {
  title: "Pages/SignOutPage",
  component: SignOutPage,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: { appName: "Hirelitt", status: "ready", showThemeToggle: false },
  argTypes: { onSignOut: { action: "signOut" }, onSignIn: { action: "signIn" }, onCancel: { action: "cancel" } },
};
export default meta;
type Story = StoryObj<typeof SignOutPage>;

export const Confirm: Story = {};
export const Loading: Story = { args: { status: "loading" } };
export const Pending: Story = { args: { status: "pending" } };
export const SignedOut: Story = { args: { status: "signed-out" } };
export const Retry: Story = { args: { error: "Sign-out couldn’t finish. Check your connection and try again." } };
export const Unavailable: Story = { args: { status: "unavailable" } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: "mobile1" } } };
export const Spanish: Story = { args: { copy: {
  welcome: "TU ESPACIO HIRELITT", title: "¿Cerrar sesión en Hirelitt?",
  description: "Tendrás que iniciar sesión de nuevo para acceder a tu espacio.",
  button: "Cerrar sesión", cancel: "Cancelar", loading: "Comprobando tu sesión…",
  pending: "Cerrando sesión…", unavailable: "No se puede cerrar sesión. Actualiza la página.",
  signedOutTitle: "Has cerrado sesión.", signedOutDescription: "Vuelve cuando quieras.",
  signIn: "Iniciar sesión", help: "¿Necesitas ayuda?", helpLink: "Contacta a tu administrador",
  footnote: "Tu cuenta de trabajo. Tu espacio conectado.", footer: "Creado para tu equipo.",
} } };
export const ThemeControl: Story = {
  args: { showThemeToggle: true },
  decorators: [(Story) => <ThemeProvider><Story /></ThemeProvider>],
};
