"use client";

import { useId, type ReactNode } from "react";
import { ArrowRight, Check, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "./button";
import { ProductMark } from "./product-mark";
import { ThemeToggle } from "./theme";

/** All visible copy can be translated without coupling the library to i18n. */
export interface SignInPageCopy {
  eyebrow: string;
  headline: string;
  headlineAccent: string;
  introduction: string;
  illustrationCaption: string;
  firstBenefit: string;
  secondBenefit: string;
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

/** Decorative, fictional access map: never fetch staff data before sign-in. */
function WorkspaceIllustration({ caption }: { caption: string }) {
  return (
    <div className="carbon-sign-in-illustration" aria-hidden="true">
      <svg viewBox="0 0 600 280" fill="none" className="carbon-sign-in-network">
        <path d="M0 140H600M300 0V280" stroke="var(--color-border-subtle)" strokeDasharray="3 7" />
        <ellipse cx="300" cy="140" rx="238" ry="102" stroke="var(--color-border)" />
        <ellipse cx="300" cy="140" rx="166" ry="70" stroke="var(--color-border-subtle)" />
        <path d="M102 78L300 140L492 76M102 204L300 140L492 204" stroke="var(--color-accent)" strokeOpacity=".4" />
        <path d="M300 104V48M300 176V235" stroke="var(--color-accent)" strokeOpacity=".4" />
        {[ [102, 78], [102, 204], [492, 76], [492, 204], [300, 40], [300, 240] ].map(([x, y], i) => (
          <g key={i}>
            <rect x={x - 17} y={y - 17} width="34" height="34" rx="10" fill="var(--color-surface-raised)" stroke="var(--color-border)" />
            <circle cx={x} cy={y} r="4" fill={i % 2 ? "var(--color-text-muted)" : "var(--color-accent)"} />
          </g>
        ))}
        <rect x="262" y="102" width="76" height="76" rx="22" fill="var(--color-surface)" stroke="var(--color-accent)" />
        <path d="M300 119L315 125V139C315 151 300 161 300 161S285 151 285 139V125L300 119Z" fill="var(--color-accent-muted)" stroke="var(--color-accent)" />
        <path d="M294 139L299 144L308 134" stroke="var(--color-accent-text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="carbon-sign-in-mapCaption"><span className="h-1.5 w-1.5 rounded-full bg-accent" /> {caption}</div>
    </div>
  );
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
    eyebrow: "ONE WORKSPACE. ALL YOUR POSSIBILITIES.",
    headline: "Your work.",
    headlineAccent: "Better connected.",
    introduction: "The people, tools, and ideas that move us forward. Together in CarbonOS.",
    illustrationCaption: "One account. A connected workspace.",
    firstBenefit: "One work account",
    secondBenefit: "Connected across Carbon",
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
      <header className="carbon-sign-in-header">
        <ProductMark name="CarbonOS" initial="C" />
        <div className="flex items-center gap-5">
          {appName !== "CarbonOS" && <span className="hidden text-xs tracking-widest text-text-muted sm:block">{appName}</span>}
          {showThemeToggle && <ThemeToggle />}
        </div>
      </header>
      <div className="carbon-sign-in-content">
        <section className="carbon-sign-in-story" aria-labelledby={`${id}-intro`}>
          <div className="carbon-sign-in-eyebrow"><span className="h-px w-8 bg-accent" />{text.eyebrow}</div>
          <h1 id={`${id}-intro`} className="carbon-sign-in-headline">{text.headline}<br /><span className="text-accent-text">{text.headlineAccent}</span></h1>
          <p className="carbon-sign-in-intro">{text.introduction}</p>
          <WorkspaceIllustration caption={text.illustrationCaption} />
          <div className="carbon-sign-in-capabilities">
            <span><KeyRound size={15} aria-hidden="true" />{text.firstBenefit}</span>
            <span><Check size={15} aria-hidden="true" />{text.secondBenefit}</span>
          </div>
        </section>
        <section className="carbon-sign-in-signIn" aria-labelledby={`${id}-title`}>
          <div className="carbon-sign-in-panel">
            <div className="carbon-sign-in-icon" aria-hidden="true"><ShieldCheck size={25} strokeWidth={1.5} /></div>
            <p className="carbon-sign-in-eyebrow">{text.welcome}</p>
            <h2 id={`${id}-title`} className="carbon-sign-in-panelTitle">{text.title}</h2>
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
      <footer className="carbon-sign-in-footer"><span>Carbon Residential</span><span>{text.footer}</span></footer>
    </main>
  );
}
