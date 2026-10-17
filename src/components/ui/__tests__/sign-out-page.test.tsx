import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SignOutPage } from "../sign-out-page";

const common = { appName: "Hirelitt", showThemeToggle: false, onSignOut: vi.fn(), onSignIn: vi.fn() };

describe("SignOutPage", () => {
  it("requires explicit confirmation and preserves the shared help link", async () => {
    const onSignOut = vi.fn();
    render(<SignOutPage {...common} onSignOut={onSignOut} />);
    expect(screen.getByRole("heading", { name: "Sign out of Hirelitt?" })).toBeVisible();
    expect(screen.getByText("CarbonOS")).toBeVisible();
    expect(onSignOut).not.toHaveBeenCalled();
    expect(screen.getByRole("link", { name: "Contact your administrator" })).toHaveAttribute("href", "https://helpdesk.carbonresidential.com/support/tickets/new");
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard("{Enter}");
    expect(onSignOut).toHaveBeenCalledOnce();
  });

  it("lets the app handle cancellation without signing out", async () => {
    const onCancel = vi.fn();
    const onSignOut = vi.fn();
    render(<SignOutPage {...common} onSignOut={onSignOut} onCancel={onCancel} />);
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledOnce();
    expect(onSignOut).not.toHaveBeenCalled();
  });

  it.each(["loading", "pending"] as const)("disables actions while %s", async (status) => {
    const onSignOut = vi.fn();
    render(<SignOutPage {...common} status={status} onSignOut={onSignOut} onCancel={() => {}} />);
    for (const button of screen.getAllByRole("button")) {
      expect(button).toBeDisabled();
      await userEvent.click(button);
    }
    expect(onSignOut).not.toHaveBeenCalled();
  });

  it("announces failures and allows another explicit attempt", async () => {
    const onSignOut = vi.fn();
    render(<SignOutPage {...common} error="Please retry." onSignOut={onSignOut} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Please retry.");
    expect(screen.getByRole("button", { name: "Sign out" })).toHaveAccessibleDescription("Please retry.");
    await userEvent.click(screen.getByRole("button", { name: "Sign out" }));
    expect(onSignOut).toHaveBeenCalledOnce();
  });

  it("offers sign-in after the app confirms sign-out", async () => {
    const onSignIn = vi.fn();
    const onSignOut = vi.fn();
    render(<SignOutPage {...common} status="signed-out" onSignIn={onSignIn} onSignOut={onSignOut} onCancel={() => {}} />);
    expect(screen.getByRole("heading", { name: "You’re signed out." })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Cancel" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Sign in again" }));
    expect(onSignIn).toHaveBeenCalledOnce();
    expect(onSignOut).not.toHaveBeenCalled();
  });

  it("removes the destructive action when unavailable", () => {
    render(<SignOutPage {...common} status="unavailable" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Sign-out is unavailable. Refresh the page to try again. If it keeps happening, create a support ticket.");
    expect(screen.getByRole("link", { name: "create a support ticket" })).toHaveAttribute("href", "https://helpdesk.carbonresidential.com/support/tickets/new");
  });

  it("supports localized copy, help destinations and host content", () => {
    render(<SignOutPage {...common} status="signed-out" copy={{ signedOutTitle: "Sesión cerrada", signIn: "Iniciar sesión" }} supportHref="https://example.com/help"><p>Host notice</p></SignOutPage>);
    expect(screen.getByRole("heading", { name: "Sesión cerrada" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Iniciar sesión" })).toBeEnabled();
    expect(screen.getByRole("link")).toHaveAttribute("href", "https://example.com/help");
    expect(screen.getByText("Host notice")).toBeVisible();
  });
});
