import { useEffect, useMemo, useState } from "react";

/**
 * Where the launcher gets each app's logo, so an app does not have to: the
 * CarbonOS apps' Gatekeeper (`GET /api/me/apps/<key>/logo`) answers with the
 * logo of an app the signed-in person holds, to that person's own session
 * token. The launcher asks for it, caches it, and draws initials for anything
 * that is missing or fails.
 */
export interface AppLauncherLogos {
  /** Gatekeeper's origin, e.g. `https://gatekeeper.carbonresidential.com`. */
  baseUrl: string;
  /** The signed-in person's session token, e.g. Clerk's `getToken`. Null: nobody is signed in. */
  getToken: () => Promise<string | null | undefined>;
}

/** Gatekeeper caches a logo answer for five minutes; asking sooner learns nothing. */
const TTL_MS = 5 * 60 * 1000;

interface Entry {
  at: number;
  /** An object URL for the image, or null when the app has no logo (or it failed). */
  url: Promise<string | null>;
}

// Per tab. A logo is the app's, not the person's: only keys the person holds are
// ever asked for, so the same entry serves anyone who signs in on this tab later.
const cache = new Map<string, Entry>();

function logoUrl(baseUrl: string, key: string): string {
  // `inline` asks for the image itself: a browser cannot follow Gatekeeper's
  // redirect to the bucket, which is for an app's server.
  return `${baseUrl.replace(/\/+$/, "")}/api/me/apps/${encodeURIComponent(key)}/logo?inline=1`;
}

async function fetchLogo(logos: AppLauncherLogos, key: string): Promise<string | null> {
  try {
    const token = await logos.getToken();
    if (!token) return null;
    const response = await fetch(logoUrl(logos.baseUrl, key), {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "omit",
    });
    if (!response.ok || !response.headers.get("content-type")?.startsWith("image/")) return null;
    return URL.createObjectURL(await response.blob());
  } catch {
    return null;
  }
}

function logoFor(logos: AppLauncherLogos, key: string): Promise<string | null> {
  const id = `${logos.baseUrl}\n${key}`;
  const hit = cache.get(id);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.url;
  const entry: Entry = { at: Date.now(), url: fetchLogo(logos, key) };
  cache.set(id, entry);
  return entry.url;
}

/** Empties the cache. For tests. */
export function clearAppLogoCache(): void {
  cache.clear();
}

/**
 * The logos of `keys`, by key, once `enabled` (the panel is open) — filled in as
 * each one arrives. A key with no logo is absent, so its row keeps the initials.
 */
export function useAppLogos(
  logos: AppLauncherLogos | undefined,
  keys: readonly string[],
  enabled: boolean,
): ReadonlyMap<string, string> {
  const [found, setFound] = useState<ReadonlyMap<string, string>>(new Map());
  const wanted = useMemo(() => [...new Set(keys)].sort().join("\n"), [keys]);
  const baseUrl = logos?.baseUrl;
  const getToken = logos?.getToken;

  useEffect(() => {
    if (!enabled || !baseUrl || !getToken || wanted === "") return;
    let live = true;
    for (const key of wanted.split("\n")) {
      void logoFor({ baseUrl, getToken }, key).then((url) => {
        if (!live || !url) return;
        setFound((previous) => (previous.get(key) === url ? previous : new Map(previous).set(key, url)));
      });
    }
    return () => {
      live = false;
    };
  }, [enabled, baseUrl, getToken, wanted]);

  return found;
}
