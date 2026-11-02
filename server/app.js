import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { clerkMiddleware, clerkClient, getAuth } from "@clerk/express";
import { checkAccess } from "./access.js";

const root = fileURLToPath(new URL("../", import.meta.url));
export function createApp({
  env = process.env,
  staticDir = path.join(root, "storybook-static"),
  authDir = path.join(root, "auth-static"),
  authenticate,
  readAuth = getAuth,
  getUser = (id) => clerkClient.users.getUser(id),
  fetch: doFetch = fetch,
} = {}) {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use((_req, res, next) => {
    res.set({ "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "strict-origin-when-cross-origin" });
    next();
  });
  app.get("/healthz", (_req, res) => res.json({ ok: true }));
  const publishableKey = env.CLERK_PUBLISHABLE_KEY?.trim();
  const secretKey = env.CLERK_SECRET_KEY?.trim();
  const gatekeeperUrl = env.GATEKEEPER_URL?.trim();
  const origin = env.APP_ORIGIN?.trim();
  const configured = Boolean(publishableKey && secretKey && gatekeeperUrl && origin);
  if (env.NODE_ENV === "production" && origin) {
    const canonical = new URL(origin);
    app.use((req, res, next) => req.hostname === canonical.hostname
      ? next() : res.redirect(308, `${canonical.origin}${req.originalUrl}`));
  }
  app.get("/auth/config", (_req, res) => res.json({ publishableKey: configured ? publishableKey : null }));
  app.use("/auth-assets", express.static(authDir, { index: false, dotfiles: "deny", cacheControl: false }));
  app.get(["/sign-in", "/sign-in/sso-callback", "/denied", "/sign-out"], (_req, res) => res.sendFile(path.join(authDir, "index.html")));
  // Missing credentials never restore the old unauthenticated static server.
  app.use((req, res, next) => {
    if (configured) return next();
    if (req.path === "/auth/status" || !isDocument(req)) return res.status(503).json({ reason: "unconfigured" });
    return res.redirect(303, "/sign-in");
  });
  app.use(authenticate ?? clerkMiddleware({
    publishableKey, secretKey, authorizedParties: origin ? [origin] : [],
    signInUrl: origin ? `${origin}/sign-in` : undefined,
  }));
  app.use(async (req, res, next) => {
    try {
      const result = await checkAccess({ auth: readAuth(req), getUser, gatekeeperUrl, fetch: doFetch });
      if (req.path === "/auth/status") return res.status(result.status).json(result);
      if (result.status === 200) return next();
      if (isDocument(req)) return res.redirect(303, result.status === 401 ? "/sign-in" : `/denied?reason=${result.reason}`);
      return res.status(result.status).json({ reason: result.reason });
    } catch (error) { return next(error); }
  });
  // Keep AFTER both gates: iframe.html, index.json, bundles, maps and fixtures too.
  app.use(express.static(staticDir, { dotfiles: "deny", cacheControl: false }));
  app.get("*", (_req, res) => res.sendFile(path.join(staticDir, "index.html")));
  app.use((_error, _req, res, _next) => res.status(503).json({ reason: "unavailable" }));
  return app;
}
function isDocument(req) {
  return (req.method === "GET" || req.method === "HEAD") &&
    (req.get("sec-fetch-dest") === "document" || req.get("accept")?.includes("text/html"));
}
