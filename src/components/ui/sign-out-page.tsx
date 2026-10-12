"use client";

import type { ReactNode } from "react";
import { Button } from "./button";
import { SignInPage, type SignInPageCopy } from "./sign-in-page";

export interface SignOutPageCopy extends SignInPageCopy {
  cancel: string;
  signedOutTitle: string;
  signedOutDescription: string;
  signIn: string;
}

export interface SignOutPageProps {
  appName?: string;
  /** Called only when the user explicitly confirms. The app owns session cleanup. */
  onSignOut: () => void;
  /** Return to the app's sign-in route after the session has ended. */
  onSignIn: () => void;
  onCancel?: () => void;
  /** Set signed-out only after the app has confirmed that no session remains. */
  status?: "ready" | "loading" | "pending" | "unavailable" | "signed-out";
  error?: string | null;
  copy?: Partial<SignOutPageCopy>;
  supportHref?: string;
  showThemeToggle?: boolean;
  children?: ReactNode;
  className?: string;
}

/** Shared authentication presentation; never ends a session on render or mount. */
export function SignOutPage({
  appName = "CarbonOS", onSignOut, onSignIn, onCancel, status = "ready",
  error, copy, supportHref, showThemeToggle = true, children, className,
}: SignOutPageProps) {
  const signedOut = status === "signed-out";
  const text: Partial<SignInPageCopy> = {
    welcome: `YOUR ${appName.toUpperCase()} WORKSPACE`,
    title: `Sign out of ${appName}?`,
    description: "You’ll need to sign in again to access your workspace.",
    button: "Sign out",
    loading: "Checking your session…",
    pending: "Signing out…",
    unavailable: "Sign-out is unavailable. Refresh the page to try again.",
    help: "Need a hand?",
    ...copy,
  };
  if (signedOut) {
    text.title = copy?.signedOutTitle ?? "You’re signed out.";
    text.description = copy?.signedOutDescription ?? `Sign in with your work account whenever you’re ready to return to ${appName}.`;
    text.button = copy?.signIn ?? "Sign in again";
  }

  return (
    <SignInPage
      appName={appName}
      onSignIn={signedOut ? onSignIn : onSignOut}
      status={signedOut ? "ready" : status}
      error={error}
      copy={text}
      supportHref={supportHref}
      showThemeToggle={showThemeToggle}
      className={className}
    >
      {!signedOut && onCancel && (
        <Button type="button" variant="outline" className="mt-3 w-full" disabled={status === "pending" || status === "loading"} onClick={onCancel}>
          {copy?.cancel ?? "Cancel"}
        </Button>
      )}
      {children}
    </SignInPage>
  );
}
