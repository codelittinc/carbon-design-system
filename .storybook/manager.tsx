import React, { useEffect, useState } from "react";
import { addons, types } from "@storybook/manager-api";
import { ClerkProvider } from "@clerk/react";

// Keep Clerk's session cookie refreshed while Storybook is open. The server still
// verifies access on every request; this toolbar controls no authorization.
function SessionTool() {
  const [key, setKey] = useState<string | null>(null);
  useEffect(() => {
    fetch("/auth/config", { cache: "no-store" }).then((r) => r.json()).then((config) => setKey(config.publishableKey)).catch(() => {});
  }, []);
  if (!key) return null;
  return <ClerkProvider publishableKey={key} signInUrl="/sign-in"><a href="/sign-out" style={{ padding: "0 10px", color: "inherit", fontSize: 12 }}>Sign out</a></ClerkProvider>;
}
addons.register("carbon/session", () => {
  addons.add("carbon/session/sign-out", { type: types.TOOL, title: "Sign out", render: () => <SessionTool /> });
});
