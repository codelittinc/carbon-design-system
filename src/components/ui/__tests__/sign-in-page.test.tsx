import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SignInPage } from "../sign-in-page";

const common = { showThemeToggle: false };

describe("SignInPage", () => {
  it("keeps CarbonOS branding while naming the destination app", () => {
    const { rerender } = render(<SignInPage {...common} appName="Gatekeeper" onSignIn={() => {}} />);
    expect(screen.getByText("CarbonOS")).toBeVisible();
    expect(screen.getByRole("heading", { name: "Welcome" })).toBeVisible();
    expect(screen.getByText("CONTINUE TO GATEKEEPER")).toBeVisible();
    rerender(<SignInPage {...common} appName="Reimbursements" onSignIn={() => {}} />);
    expect(screen.getByText("CONTINUE TO REIMBURSEMENTS")).toBeVisible();
    expect(screen.queryByText(/Gatekeeper/)).not.toBeInTheDocument();
  });

  it("delegates activation to the app and supports keyboard activation", async () => {
    const onSignIn = vi.fn();
    render(<SignInPage {...common} onSignIn={onSignIn} />);
    const user = userEvent.setup();
    await user.tab();
    expect(screen.getByRole("button", { name: "Continue to sign in" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onSignIn).toHaveBeenCalledTimes(1);
  });

  it.each(["loading", "pending"] as const)("prevents sign-in during %s", async (status) => {
    const onSignIn = vi.fn();
    render(<SignInPage {...common} status={status} onSignIn={onSignIn} />);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    await userEvent.click(button);
    expect(onSignIn).not.toHaveBeenCalled();
  });

  it("announces an error, associates it with the action, and allows retry", async () => {
    const onSignIn = vi.fn();
    render(<SignInPage {...common} error="Please try again." onSignIn={onSignIn} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Please try again.");
    const button = screen.getByRole("button");
    expect(button).toHaveAccessibleDescription("Please try again.");
    await userEvent.click(button);
    expect(onSignIn).toHaveBeenCalledOnce();
  });

  it("offers no sign-in action when the app is unavailable", () => {
    render(<SignInPage {...common} status="unavailable" onSignIn={() => {}} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Sign-in is unavailable");
  });

  it("accepts localized copy and leaves provider challenge UI with the app", () => {
    render(<SignInPage {...common} onSignIn={() => {}} copy={{ button: "Continuar", title: "Bienvenido" }}>
      <div data-testid="provider-challenge" />
    </SignInPage>);
    expect(screen.getByRole("heading", { name: "Bienvenido" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Continuar" })).toBeEnabled();
    expect(screen.getByTestId("provider-challenge")).toBeInTheDocument();
  });
});
