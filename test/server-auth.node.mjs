import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { once } from "node:events";
import { createApp } from "../server/app.js";

const user = { primaryEmailAddressId: "email_1", emailAddresses: [{ id: "email_1", emailAddress: "person@example.com", verification: { status: "verified" } }] };
const env = { CLERK_PUBLISHABLE_KEY: "pk_test_dummy", CLERK_SECRET_KEY: "sk_test_dummy", APP_ORIGIN: "https://design-system.example.com", GATEKEEPER_URL: "https://gatekeeper.example.com" };
async function fixture(t, overrides = {}) {
  const dir = await mkdtemp(path.join(tmpdir(), "design-system-auth-"));
  const authDir = path.join(dir, "auth");
  await mkdir(authDir);
  await writeFile(path.join(authDir, "index.html"), "PUBLIC SIGN IN");
  await writeFile(path.join(authDir, "login.js"), "PUBLIC AUTH SCRIPT");
  for (const file of ["index.html", "iframe.html", "index.json", "bundle.js", "fixture.csv"]) await writeFile(path.join(dir, file), "PRIVATE STORYBOOK");
  let standing = { person: { id: "person_1" }, app: { key: "design-system", status: "active", roles: ["standard"] } };
  const calls = [];
  const app = createApp({
    env, staticDir: dir, authDir,
    authenticate: (_req, _res, next) => next(),
    readAuth: () => ({ userId: "user_1", getToken: async () => "verified-session-token" }),
    getUser: async () => user,
    fetch: async (url, options) => { calls.push({ url, options }); return Response.json(standing); },
    ...overrides,
  });
  const server = app.listen(0, "127.0.0.1"); await once(server, "listening");
  t.after(async () => { server.closeAllConnections(); await new Promise((resolve) => server.close(resolve)); await rm(dir, { recursive: true, force: true }); });
  return { get: (url, headers = {}) => fetch(`http://127.0.0.1:${server.address().port}${url}`, { headers, redirect: "manual" }), calls, setStanding: (value) => { standing = value; } };
}

test("signed-out requests cannot fetch any Storybook page or asset", async (t) => {
  const f = await fixture(t, { readAuth: () => ({ userId: null }) });
  for (const file of ["/", "/iframe.html", "/index.json", "/bundle.js", "/fixture.csv", "/?path=/docs/private"]) {
    const response = await f.get(file);
    assert.equal(response.status, 401, file); assert.doesNotMatch(await response.text(), /PRIVATE/);
  }
  const navigation = await f.get("/", { accept: "text/html" });
  assert.equal(navigation.status, 303); assert.equal(navigation.headers.get("location"), "/sign-in");
  assert.equal(await (await f.get("/sign-in")).text(), "PUBLIC SIGN IN");
  assert.equal((await f.get("/auth-assets/login.js")).status, 200);
  assert.equal((await f.get("/auth-assets/index.json")).status, 401);
  assert.equal((await f.get("/auth-assets/../index.json")).status, 401);
  assert.equal(f.calls.length, 0);
});
test("missing config fails closed while health and sign-in remain reachable", async (t) => {
  const f = await fixture(t, { env: {} });
  assert.equal((await f.get("/index.json")).status, 503);
  assert.equal((await f.get("/healthz")).status, 200);
  assert.deepEqual(await (await f.get("/auth/config")).json(), { publishableKey: null });
  assert.equal((await f.get("/sign-in")).status, 200);
});
test("active standard grant serves assets, forwards only the session token and disables caching", async (t) => {
  const f = await fixture(t);
  const response = await f.get("/index.json");
  assert.equal(response.status, 200); assert.equal(await response.text(), "PRIVATE STORYBOOK");
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.equal(f.calls[0].url, "https://gatekeeper.example.com/api/me?app=design-system");
  assert.equal(f.calls[0].options.headers.Authorization, "Bearer verified-session-token");
  assert.equal(f.calls[0].options.cache, "no-store");
});
test("revoked, pending, missing, wrong-product and wrong-role access all deny", async (t) => {
  const f = await fixture(t);
  assert.equal((await f.get("/iframe.html")).status, 200);
  for (const app of [null, { key: "design-system", status: "revoked", roles: ["standard"] }, { key: "design-system", status: "pending", roles: ["standard"] }, { key: "other", status: "active", roles: ["standard"] }, { key: "design-system", status: "active", roles: ["admin"] }, { key: "design-system", status: "active", roles: [] }]) {
    f.setStanding({ person: { id: "person_1" }, app });
    assert.equal((await f.get("/iframe.html")).status, 403);
  }
  f.setStanding({ person: null, app: null });
  assert.equal((await f.get("/index.json")).status, 403);
});
test("unverified primary email cannot fall back to a verified secondary email", async (t) => {
  const f = await fixture(t, { getUser: async () => ({ primaryEmailAddressId: "primary", emailAddresses: [{ id: "primary", verification: { status: "unverified" } }, ...user.emailAddresses] }) });
  assert.equal((await f.get("/index.json")).status, 403); assert.equal(f.calls.length, 0);
});
test("Gatekeeper failures and malformed replies never expose Storybook", async (t) => {
  for (const fail of [async () => { throw new Error("network"); }, async () => new Response("no", { status: 500 }), async () => new Response("invalid json"), async () => Response.json({ app: { status: "active", roles: ["standard"] } })]) {
    const f = await fixture(t, { fetch: fail });
    const response = await f.get("/bundle.js"); assert.equal(response.status, 503); assert.doesNotMatch(await response.text(), /PRIVATE/);
  }
});
test("a stalled dependency fails closed within the access budget", async (t) => {
  const f = await fixture(t, { fetch: () => new Promise(() => {}) });
  const start = Date.now(); assert.equal((await f.get("/index.json")).status, 503); assert.ok(Date.now() - start < 2200);
});
