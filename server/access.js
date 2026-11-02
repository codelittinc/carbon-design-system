export const APP_KEY = "design-system";
export const GATEKEEPER_TIMEOUT_MS = 1500;

// No access cache: a revoke takes effect on the next request, including assets.
export async function checkAccess({ auth, getUser, gatekeeperUrl, fetch: doFetch = fetch }) {
  if (!auth.userId) return { status: 401, reason: "signed-out" };
  try {
    const signal = AbortSignal.timeout(GATEKEEPER_TIMEOUT_MS);
    const work = async () => {
      const user = await getUser(auth.userId);
      const primary = user?.emailAddresses.find((email) => email.id === user.primaryEmailAddressId);
      if (primary?.verification?.status !== "verified") return { status: 403, reason: "unverified-email" };
      const token = await auth.getToken();
      if (!token) return { status: 401, reason: "signed-out" };
      const response = await doFetch(`${gatekeeperUrl.replace(/\/+$/, "")}/api/me?app=${APP_KEY}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        cache: "no-store", redirect: "error", signal,
      });
      if (!response.ok) return { status: 503, reason: "unavailable" };
      const body = await response.json();
      if (!body || !(body.person === null || (typeof body.person?.id === "string" && body.person.id)) ||
          !(body.app === null || (typeof body.app?.key === "string" && typeof body.app.status === "string" &&
            Array.isArray(body.app.roles) && body.app.roles.every((role) => typeof role === "string")))) {
        return { status: 503, reason: "unavailable" };
      }
      if (!body.person || body.app?.key !== APP_KEY || body.app.status !== "active" || !body.app.roles.includes("standard")) {
        return { status: 403, reason: "not-invited" };
      }
      return { status: 200, role: "standard" };
    };
    // Clerk lookups and token retrieval share the same bounded budget as Gatekeeper.
    return await Promise.race([
      work(),
      new Promise((_, reject) => signal.addEventListener("abort", () => reject(new Error("Access check timed out")), { once: true })),
    ]);
  } catch {
    return { status: 503, reason: "unavailable" };
  }
}
