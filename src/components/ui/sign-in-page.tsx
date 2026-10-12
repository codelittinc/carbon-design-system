"use client";

import { useId, type ReactNode } from "react";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "./button";
import { ProductMark } from "./product-mark";
import { ThemeToggle } from "./theme";

/** All visible copy can be translated without coupling the library to i18n. */
export interface SignInPageCopy {
  welcome: string;
  title: string;
  description: string;
  button: string;
  loading: string;
  pending: string;
  unavailable: string;
  help: string;
  footnote: string;
  footer: string;
}

export interface SignInPageProps {
  /** Destination app. The shared brand remains CarbonOS. */
  appName?: string;
  /** The app owns authentication, redirects, async errors, and status updates. */
  onSignIn: () => void;
  status?: "ready" | "loading" | "pending" | "unavailable";
  /** Safe, user-facing text. The library never exposes provider responses. */
  error?: string | null;
  copy?: Partial<SignInPageCopy>;
  /** A provider's challenge container or other authentication continuation UI. */
  children?: ReactNode;
  /** Requires ThemeProvider when true (the default). */
  showThemeToggle?: boolean;
  className?: string;
}

/**
 * The shared CarbonOS front door. Presentational: no Clerk, Next.js, environment
 * variables, session reads, redirects, or app-specific access rules.
 * Import the package's /styles once and mount under ThemeProvider.
 */
export function SignInPage({
  appName = "CarbonOS", onSignIn, status = "ready", error, copy,
  children, showThemeToggle = true, className,
}: SignInPageProps) {
  const id = useId();
  const text: SignInPageCopy = {
    welcome: appName === "CarbonOS" ? "YOUR CARBON WORKSPACE" : `CONTINUE TO ${appName.toUpperCase()}`,
    title: "Welcome back.",
    description: `Sign in with your Carbon work account to continue to ${appName}.`,
    button: "Continue with Google",
    loading: "Preparing sign-in…",
    pending: "Connecting to Google…",
    unavailable: "Sign-in is unavailable. Please try again later.",
    help: "Need access or a hand signing in? Contact your administrator.",
    footnote: "Your work account. Your connected workspace.",
    footer: "Built around your people.",
    ...copy,
  };
  const busy = status === "loading" || status === "pending";
  return (
    <main className={cn("carbon-sign-in-page", className)}>
      <div className="carbon-sign-in-content">
        <section className="carbon-sign-in-signIn" aria-labelledby={`${id}-title`}>
          <div className="carbon-sign-in-brand"><ProductMark name="CarbonOS" initial="C" /></div>
          <div className="carbon-sign-in-panel">
            <p className="carbon-sign-in-eyebrow">{text.welcome}</p>
            <h1 id={`${id}-title`} className="carbon-sign-in-panelTitle">{text.title}</h1>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-text-secondary">{text.description}</p>
            <div className="mt-9" aria-busy={busy}>
              {status === "unavailable" ? (
                <p role="status" className="text-sm text-text-secondary">{text.unavailable}</p>
              ) : (
                <Button type="button" size="lg" className="h-12 w-full justify-between" disabled={status !== "ready"} onClick={onSignIn} aria-describedby={error ? `${id}-error` : undefined}>
                  <span aria-live="polite">{status === "loading" ? text.loading : status === "pending" ? text.pending : text.button}</span>
                  <ArrowRight size={18} aria-hidden="true" />
                </Button>
              )}
              {error && <p id={`${id}-error`} className="mt-3 text-sm text-error-text" role="alert">{error}</p>}
              {children}
            </div>
            <div className="carbon-sign-in-help">
              <LockKeyhole size={15} className="shrink-0 text-text-muted" aria-hidden="true" />
              <p>{text.help}</p>
            </div>
          </div>
          <p className="carbon-sign-in-panelFootnote">{text.footnote}</p>
        </section>
      </div>
      <footer className="carbon-sign-in-footer"><span>Carbon Residential</span><span>{text.footer}</span>{showThemeToggle && <ThemeToggle />}</footer>
    </main>
  );
}
