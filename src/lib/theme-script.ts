/**
 * The pre-paint theme script, kept apart from `components/ui/theme.tsx` so it
 * carries no `"use client"` and no React. A Next.js root layout is a server
 * component and builds this string there; imported from the package root it
 * came back as a client reference and failed the build with "Attempted to call
 * themeScript() from the server". Export it from `src/utils.ts` for that case.
 */

export type Theme = "light" | "dark";

/** The localStorage key the script reads and `ThemeProvider` writes. */
export const THEME_STORAGE_KEY = "carbon-theme";

export interface ThemeScriptOptions {
  /**
   * The theme to use when nothing valid is saved in localStorage. Defaults to
   * `"dark"`, the design system's default.
   */
  defaultTheme?: Theme;
}

/**
 * Builds the inline script to drop into <head> so the saved theme is applied
 * before the first paint. It always sets an explicit `light`/`dark` class so
 * consumers can read it back on hydration; with nothing saved it uses
 * `defaultTheme`. Without it, a saved light preference would flash dark on load.
 *
 * Pair it with `<ThemeProvider defaultTheme={...}>` using the same value.
 *
 * Usage (Next.js root layout, a server component):
 *   import { themeScript } from "@codelittinc/carbon-design-system/utils";
 *   <head><script dangerouslySetInnerHTML={{ __html: themeScript({ defaultTheme: "light" }) }} /></head>
 */
export function themeScript({ defaultTheme = "dark" }: ThemeScriptOptions = {}): string {
  // Only ever interpolate one of the two literals into the script.
  const fallback: Theme = defaultTheme === "light" ? "light" : "dark";
  return `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t!=="light"&&t!=="dark")t="${fallback}";var c=document.documentElement.classList;c.remove("light","dark");c.add(t);}catch(e){}})();`;
}

/**
 * `themeScript()` with the default (dark) fallback. Kept for compatibility;
 * use `themeScript({ defaultTheme })` to pick the default.
 *
 * Usage (Next.js app root):
 *   <head><script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} /></head>
 */
export const THEME_SCRIPT = themeScript();
