import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
// @ts-expect-error — a plain .mjs build script, typed by use here.
import { colorTokensFrom, tokensSource } from "../scripts/generate-tokens.mjs";
import { colorTokens } from "../src/tokens";

/**
 * src/tokens.ts is generated from theme.css. If they disagree, an app that reads plain values
 * (a PDF, an email) silently drifts from every app that reads the stylesheet. Lives in `test/`
 * because it reads theme.css from disk (see category-tokens.test.ts).
 */
const themeCss = readFileSync(resolve(process.cwd(), "src/styles/theme.css"), "utf8");
const committed = readFileSync(resolve(process.cwd(), "src/tokens.ts"), "utf8");

describe("plain colour tokens", () => {
  it("src/tokens.ts is exactly what theme.css generates", () => {
    expect(committed, "run `pnpm tokens:generate`").toBe(tokensSource(themeCss));
  });

  it("covers every --color-* token theme.css declares, in both themes", () => {
    const declared = new Set(Array.from(themeCss.matchAll(/--color-([a-z0-9-]+)\s*:/g), (m) => m[1]));
    for (const theme of ["dark", "light"] as const) {
      expect(new Set(Object.keys(colorTokens[theme]))).toEqual(declared);
    }
  });

  it("resolves every var() reference, so each value works where CSS variables do not", () => {
    for (const theme of ["dark", "light"] as const) {
      for (const value of Object.values(colorTokens[theme])) expect(value).not.toContain("var(");
    }
  });

  it("applies .light over the defaults and leaves the theme-independent fills alone", () => {
    expect(colorTokens.dark.bg).toBe("#09090b");
    expect(colorTokens.light.bg).toBe("#fafafa");
    expect(colorTokens.light["accent-foreground"]).toBe("#ffffff");
    expect(colorTokens.light["category-1"]).toBe(colorTokens.dark["category-1"]);
  });

  it("rejects a reference to a token theme.css never declares", () => {
    const broken = "@theme {\n  --color-a: var(--color-missing);\n}\n@theme static {\n}\n.light {\n}\n.dark {\n}";
    expect(() => colorTokensFrom(broken)).toThrow(/--color-missing/);
  });
});
