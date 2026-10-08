import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Guards the `"use client"` boundary in the **committed** dist/.
 *
 * Lives in `test/` rather than `src/**​/__tests__/` — the repo's convention for
 * unit tests — because it asserts on build *output* rather than on a source
 * module, and reading it needs Node APIs. `tsconfig.json` covers only `src` and
 * `.storybook` and the repo carries no `@types/node`, so a file here keeps the
 * guard without widening either. Vitest still collects it.
 *
 * Consumers install this package as a git dependency pinned to a commit SHA, so
 * what they execute is the `dist/` in that commit — not a fresh build. That
 * makes the committed output part of the public contract, and these two facts
 * part of it:
 *
 *   - dist/index.js MUST carry the directive. Without it an RSC bundler would
 *     try to render Radix-based components on the server.
 *   - dist/utils.js MUST NOT. The directive turns every export in a module into
 *     a client reference, so `cn` would throw "Attempted to call cn() from the
 *     server" when a server component called it — which is exactly the 500 that
 *     put this file here.
 *
 * `tsup.config.ts` asserts the same invariant at build time; this asserts it
 * for the artifact actually in git, because CI runs tests before `build:lib`
 * and a stale or hand-edited dist/ would otherwise sail through.
 */
const DIRECTIVE = '"use client";';

/**
 * Resolved from `process.cwd()` (vitest runs at the repo root) rather than
 * `import.meta.url`, which vite rewrites to a root-relative virtual path under
 * the jsdom environment and would look for `/dist/`.
 */
function distFile(name: string): string {
  return readFileSync(resolve(process.cwd(), "dist", name), "utf8");
}

describe("committed dist/ client boundary", () => {
  it("marks the component barrel as client code", () => {
    expect(distFile("index.js").startsWith(DIRECTIVE)).toBe(true);
  });

  it("marks the lazily loaded editor as client code", () => {
    expect(distFile("rich-text-editor-impl.js").startsWith(DIRECTIVE)).toBe(true);
  });

  it("reaches TipTap from the barrel only through the editor's dynamic import", () => {
    // TipTap's packages are not side-effect free, so one static import here
    // would put all of it on every page of every app. See
    // src/components/ui/rich-text-editor-loader.ts.
    const index = distFile("index.js");
    expect(index).not.toMatch(/from ['"]@tiptap\//);
    expect(index).toContain("import('./rich-text-editor-impl.js')");
  });

  it("reaches docx-preview and papaparse from the barrel only through dynamic imports", () => {
    // FileViewer's DOCX and CSV renderers. A static import would put a zip
    // reader and a CSV parser on every page of every app, viewer or not.
    const index = distFile("index.js");
    expect(index).not.toMatch(/from\s*['"]docx-preview['"]/);
    expect(index).not.toMatch(/from\s*['"]papaparse['"]/);
    expect(index).not.toMatch(/import\s*['"](?:docx-preview|papaparse)['"]/);
    expect(index).toMatch(/import\(\s*['"]docx-preview['"]\s*\)/);
    expect(index).toMatch(/import\(\s*['"]papaparse['"]\s*\)/);
  });

  it("leaves the utils entry callable from a server component", () => {
    expect(distFile("utils.js").startsWith(DIRECTIVE)).toBe(false);
  });

  it("leaves the tokens entry importable from a server component", () => {
    expect(distFile("tokens.js").startsWith(DIRECTIVE)).toBe(false);
  });

  it("ships the same colour values in dist/tokens.js as src/tokens.ts", async () => {
    // src/tokens.ts is checked against theme.css, but a PDF or email on a pinned SHA runs this
    // file. Editing theme.css and running tokens:generate without build:lib would leave it stale.
    const [built, source] = await Promise.all([
      import("../dist/tokens.js"),
      import("../src/tokens"),
    ]);
    expect(built.colorTokens, "run `pnpm run build:lib`").toEqual(source.colorTokens);
  });

  it("ships the same token names and values in dist/tokens.d.ts as src/tokens.ts", async () => {
    // The types are what tell a consumer a token exists, so a stale .d.ts breaks their build
    // (or promises a token that is undefined at runtime) even when dist/tokens.js is current.
    const { colorTokens } = await import("../src/tokens");
    const dts = distFile("tokens.d.ts");
    const lightAt = dts.indexOf("readonly light:");
    const entries = (types: string) =>
      // tsc quotes a key only when it is not an identifier ("carbon-950" but bg).
      Array.from(types.matchAll(/readonly (?:"([^"]+)"|([\w$]+)): "([^"]+)";/g), (m) => [m[1] ?? m[2], m[3]]);
    expect(lightAt, "run `pnpm run build:lib`").toBeGreaterThan(-1);
    expect(entries(dts.slice(0, lightAt))).toEqual(Object.entries(colorTokens.dark));
    expect(entries(dts.slice(lightAt))).toEqual(Object.entries(colorTokens.light));
  });

  it("exports cn and the formatters from the utils entry", async () => {
    const utils = await import("../src/utils");
    expect(typeof utils.cn).toBe("function");
    expect(typeof utils.formatMoney).toBe("function");
    expect(typeof utils.formatDate).toBe("function");
    expect(typeof utils.formatPeriodLabel).toBe("function");
  });

  it("exports themeScript and THEME_SCRIPT from the utils entry", async () => {
    // A Next.js root layout is a server component and builds this string there.
    // From the package root it is a client reference and fails the build.
    const utils = await import("../src/utils");
    const root = await import("../src/index");
    expect(utils.themeScript({ defaultTheme: "light" })).toBe(
      '(function(){try{var t=localStorage.getItem("carbon-theme");if(t!=="light"&&t!=="dark")t="light";var c=document.documentElement.classList;c.remove("light","dark");c.add(t);}catch(e){}})();',
    );
    expect(utils.themeScript()).toBe(utils.THEME_SCRIPT);
    expect(utils.THEME_SCRIPT).toContain('t="dark"');
    // The root entry keeps exporting the same function for client imports.
    expect(root.themeScript).toBe(utils.themeScript);
    expect(root.THEME_SCRIPT).toBe(utils.THEME_SCRIPT);
  });

  it("ships themeScript in the committed dist/utils.js", async () => {
    const built = await import("../dist/utils.js");
    expect(typeof built.themeScript, "run `pnpm run build:lib`").toBe("function");
    expect(built.themeScript({ defaultTheme: "light" })).toContain('t="light"');
    expect(built.THEME_SCRIPT).toContain('t="dark"');
    expect(distFile("utils.d.ts")).toMatch(/themeScript/);
  });

  it("keeps cn merging conflicting tailwind classes", async () => {
    // The reason a consumer wants cn rather than string concatenation: class
    // attribute order does not settle a conflict, so p-0 must win over p-4.
    const { cn } = await import("../src/utils");
    expect(cn("p-4", "p-0")).toBe("p-0");
    expect(cn("rounded-lg border", undefined, "border")).toBe(
      "rounded-lg border",
    );
  });
});
