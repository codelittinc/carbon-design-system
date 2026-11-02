import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { AuthenticateWithRedirectCallback, ClerkFailed, ClerkLoaded, ClerkLoading, ClerkProvider, useClerk, useUser } from "@clerk/react";
import { useSignIn } from "@clerk/react/legacy";
import { SignInPage } from "../src/components/ui/sign-in-page";
import { SignOutPage } from "../src/components/ui/sign-out-page";
import { ThemeProvider } from "../src/components/ui/theme";
import { Button } from "../src/components/ui/button";
import "../src/styles/theme.css";

const appName = "Design System";
const noop = () => {};
function SignIn() {
  const { signIn } = useSignIn();
  const { isSignedIn } = useUser();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (isSignedIn) window.location.replace("/"); }, [isSignedIn]);
  async function start() {
    if (!signIn || pending) return;
    setPending(true); setError(null);
    try {
      await signIn.authenticateWithRedirect({ strategy: "oauth_google", redirectUrl: "/sign-in/sso-callback", redirectUrlComplete: "/", continueSignIn: false });
    } catch { setError("Sign-in couldn’t start. Check your connection and try again."); setPending(false); }
  }
  return <SignInPage appName={appName} onSignIn={start} status={pending ? "pending" : "ready"} error={error}><div id="clerk-captcha" /></SignInPage>;
}
function SignOut() {
  const { signOut } = useClerk();
  const { isSignedIn } = useUser();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function leave() {
    setPending(true); setError(null);
    try { await signOut({ redirectUrl: "/sign-out" }); }
    catch { setError("Sign-out couldn’t finish. Try again."); setPending(false); }
  }
  return <SignOutPage appName={appName} status={pending ? "pending" : isSignedIn ? "ready" : "signed-out"} onSignOut={leave} onCancel={() => window.location.assign("/")} onSignIn={() => window.location.assign("/sign-in")} error={error} />;
}
function Denied() {
  const [reason, setReason] = useState("loading");
  useEffect(() => {
    fetch("/auth/status", { cache: "no-store", signal: AbortSignal.timeout(10_000) }).then(async (response) => {
      if (response.ok) return window.location.replace("/");
      if (response.status === 401) return window.location.replace("/sign-in");
      setReason((await response.json()).reason);
    }).catch(() => setReason("unavailable"));
  }, []);
  const message = reason === "loading" ? "Checking your access…" : reason === "not-invited"
    ? "You haven’t been given access to Design System. Ask your administrator for access."
    : reason === "unverified-email" ? "Verify your primary work email before continuing."
    : "We can’t check your access right now. Try again in a minute.";
  return <main className="min-h-screen flex items-center justify-center bg-surface-base p-6"><section className="max-w-md space-y-6"><h1 className="text-2xl font-semibold text-text-primary">Design System</h1><p role="status" className="text-text-secondary">{message}</p><div className="flex gap-3"><Button onClick={() => window.location.reload()}>Try again</Button><Button variant="outline" onClick={() => window.location.assign("/sign-out")}>Sign out</Button></div><a className="text-accent-text underline" href="https://helpdesk.carbonresidential.com/support/tickets/new">Request access</a></section></main>;
}
function Connected() {
  if (location.pathname === "/sign-in/sso-callback") return <AuthenticateWithRedirectCallback signInFallbackRedirectUrl="/" signUpFallbackRedirectUrl="/" />;
  if (location.pathname === "/sign-out") return <SignOut />;
  if (location.pathname === "/denied") return <Denied />;
  return <SignIn />;
}
function App() {
  const [config, setConfig] = useState<{ publishableKey: string | null } | null>(null);
  useEffect(() => { fetch("/auth/config", { cache: "no-store", signal: AbortSignal.timeout(10_000) }).then((r) => r.json()).then(setConfig).catch(() => setConfig({ publishableKey: null })); }, []);
  const fallback = (status: "loading" | "unavailable") => <SignInPage appName={appName} onSignIn={noop} status={status} />;
  if (!config) return fallback("loading");
  if (!config.publishableKey) return fallback("unavailable");
  return <ClerkProvider publishableKey={config.publishableKey} signInUrl="/sign-in" signInFallbackRedirectUrl="/" signUpFallbackRedirectUrl="/">
    <ClerkLoading>{fallback("loading")}</ClerkLoading><ClerkFailed>{fallback("unavailable")}</ClerkFailed><ClerkLoaded><Connected /></ClerkLoaded>
  </ClerkProvider>;
}
createRoot(document.getElementById("root")!).render(<ThemeProvider><App /></ThemeProvider>);
