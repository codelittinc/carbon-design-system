const GOOGLE_MAPS_SCRIPT_ID = "carbon-google-maps";
const GOOGLE_MAPS_LOAD_TIMEOUT_MS = 10_000;

let placesLibraryPromise: Promise<google.maps.PlacesLibrary> | null = null;

/**
 * Resolve the Google Maps API key from the host environment. Supports Vite
 * (VITE_GOOGLE_MAPS_API_KEY) and Next.js (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) so the
 * same loader works in this Storybook and in the consuming app. Access is guarded
 * so it never throws when neither `import.meta.env` nor `process` is present.
 */
function getApiKey(): string | undefined {
  const viteEnv = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
  const nodeEnv = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process
    ?.env;
  return viteEnv?.VITE_GOOGLE_MAPS_API_KEY ?? nodeEnv?.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
}

function hasGoogleImporter(): boolean {
  const maps = (window as unknown as { google?: { maps?: { importLibrary?: unknown } } }).google
    ?.maps;
  return typeof maps?.importLibrary === "function";
}

function removeOwnedScript() {
  const script = document.getElementById(GOOGLE_MAPS_SCRIPT_ID);
  if (script?.dataset.carbonOwned === "true") script.remove();
}

function waitForGoogleMaps(): Promise<void> {
  if (hasGoogleImporter()) return Promise.resolve();

  const key = getApiKey();
  if (!key) return Promise.reject(new Error("Google address suggestions are not configured"));

  return new Promise((resolve, reject) => {
    let script = document.getElementById(GOOGLE_MAPS_SCRIPT_ID) as HTMLScriptElement | null;
    let settled = false;

    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      script?.removeEventListener("load", handleLoad);
      script?.removeEventListener("error", handleError);
      if (error) {
        removeOwnedScript();
        reject(error);
      } else {
        resolve();
      }
    };
    const handleLoad = () => {
      if (hasGoogleImporter()) finish();
      else finish(new Error("Google Maps loaded without the Places library"));
    };
    const handleError = () => finish(new Error("Google Maps could not be loaded"));
    const timeout = window.setTimeout(
      () => finish(new Error("Google Maps took too long to load")),
      GOOGLE_MAPS_LOAD_TIMEOUT_MS,
    );

    if (!script) {
      script = document.createElement("script");
      script.id = GOOGLE_MAPS_SCRIPT_ID;
      script.dataset.carbonOwned = "true";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly&loading=async`;
      script.async = true;
    }

    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });
    if (!script.isConnected) document.head.appendChild(script);
    if (hasGoogleImporter()) finish();
  });
}

/** Load the current Google Places library. A failed attempt is retryable. */
export function loadGooglePlacesLibrary(): Promise<google.maps.PlacesLibrary> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Places is only available in a browser"));
  }
  if (placesLibraryPromise) return placesLibraryPromise;

  placesLibraryPromise = waitForGoogleMaps()
    .then(() => window.google.maps.importLibrary("places") as Promise<google.maps.PlacesLibrary>)
    .catch((error: unknown) => {
      placesLibraryPromise = null;
      throw error;
    });
  return placesLibraryPromise;
}
