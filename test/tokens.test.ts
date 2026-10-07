import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import postcss from "postcss";
// A plain .mjs build script. test/ is outside tsconfig's include, so this import is not type-checked.
import { colorTokensFrom, cssUnescape, plainColor, tokensSource } from "../scripts/generate-tokens.mjs";
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
    // Every `--color-*` declaration postcss finds anywhere in the file (comments are not
    // declarations), independent of how the generator picks its blocks.
    const declared = new Set<string>();
    postcss.parse(themeCss).walkDecls(/^--color-/, (decl) => {
      declared.add(cssUnescape(decl.prop.slice("--color-".length)));
    });
    for (const theme of ["dark", "light"] as const) {
      expect(new Set(Object.keys(colorTokens[theme]))).toEqual(declared);
    }
  });

  it("resolves every var() reference, so each value works where CSS variables do not", () => {
    for (const theme of ["dark", "light"] as const) {
      for (const value of Object.values(colorTokens[theme])) expect(value).not.toContain("var(");
    }
  });

  it("emits only #rrggbb or rgba(r, g, b, a), the forms react-pdf and email clients read", () => {
    const readable = /^(#[0-9a-f]{6}|rgba\(\d{1,3}, \d{1,3}, \d{1,3}, (0|1|0?\.\d+)\))$/;
    for (const theme of ["dark", "light"] as const) {
      for (const [name, value] of Object.entries(colorTokens[theme])) {
        expect(value, `${theme} ${name}`).toMatch(readable);
      }
    }
  });

  it("normalises the colour syntaxes theme.css uses", () => {
    expect(plainColor("x", "#FFF")).toBe("#ffffff");
    expect(plainColor("x", "#09090B")).toBe("#09090b");
    expect(plainColor("x", "rgb(9 9 11 / 3.5%)")).toBe("rgba(9, 9, 11, 0.035)");
    expect(plainColor("x", "rgba(255, 255, 255, 0.07)")).toBe("rgba(255, 255, 255, 0.07)");
    expect(plainColor("x", "rgb(255 0 0)")).toBe("#ff0000");
    // An alpha of 1 is still solid, so it gets the form Outlook reads too.
    expect(plainColor("x", "rgb(1 2 3 / 100%)")).toBe("#010203");
    expect(plainColor("x", "rgba(1, 2, 3, 1)")).toBe("#010203");
    expect(plainColor("x", "rgb(1 2 3 / 0.99999)")).toBe("#010203");
    // rgba() is an alias of rgb(), so its alpha is optional in CSS too.
    expect(plainColor("x", "rgba(1, 2, 3)")).toBe("#010203");
  });

  it("fails the build on a colour syntax PDFs and emails cannot read", () => {
    expect(() => plainColor("x", "oklch(0.7 0.1 50)")).toThrow(/--color-x/);
    expect(() => plainColor("x", "red")).toThrow(/--color-x/);
    expect(() => plainColor("x", "rgb(300 0 0)")).toThrow(/--color-x/);
    // Typos a browser rejects must not become a valid hex here.
    expect(() => plainColor("x", "rgb(1 2 3 / )")).toThrow(/--color-x/);
    expect(() => plainColor("x", "rgb(1, 2 3)")).toThrow(/--color-x/);
    expect(() => plainColor("x", "rgb(1 2 3 / 1.2.3)")).toThrow(/--color-x/);
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

  it("names the whole chain of a reference cycle", () => {
    const cycle =
      "@theme {\n  --color-a: var(--color-b);\n  --color-b: var(--color-a);\n}\n@theme static {\n}\n.light {\n}\n.dark {\n}";
    expect(() => colorTokensFrom(cycle)).toThrow("--color-a → --color-b → --color-a");
  });

  it("ignores a quoted selector in a comment", () => {
    const css = [
      "/* Theming: put overrides in `.light {` below, e.g. --color-brand: #123456; */",
      "@theme {\n  --color-bg: #000000;\n}",
      "@theme static {\n}",
      ".light {\n  --color-bg: #ffffff;\n}",
      ".dark {\n}",
    ].join("\n");
    expect(colorTokensFrom(css).light).toEqual({ bg: "#ffffff" });
  });

  it.each([
    ["a selector other than .light", "html.light {\n  --color-bg: #eeeeee;\n}"],
    ["an @media inside .light", ".light {\n  --color-bg: #ffffff;\n  @media (prefers-contrast: more) {\n    --color-bg: #eeeeee;\n  }\n}"],
  ])("fails the build on an override in %s, which has no plain value", (_, override) => {
    const css = [
      "@theme {\n  --color-bg: #000000;\n}",
      "@theme static {\n}",
      override.startsWith(".light") ? override : `.light {\n}\n${override}`,
      ".dark {\n}",
    ].join("\n");
    expect(() => colorTokensFrom(css)).toThrow(/--color-bg is declared outside/);
  });

  it("reads a last declaration that has no semicolon", () => {
    const css = "@theme {\n  --color-bg: #000000;\n}\n@theme static {\n}\n.light {\n  --color-bg: #ffffff\n}\n.dark {\n}";
    expect(colorTokensFrom(css).light.bg).toBe("#ffffff");
  });

  it("rejects a theme block that appears twice instead of guessing which one counts", () => {
    const twice = "@theme {\n}\n@theme static {\n}\n.light {\n}\n.light {\n}\n.dark {\n}";
    expect(() => colorTokensFrom(twice)).toThrow(/found 2/);
  });

  it("reads token names with CSS escapes", () => {
    const css = "@theme {\n  --color-gray-0\\.5: #111111;\n}\n@theme static {\n}\n.light {\n}\n.dark {\n}";
    expect(colorTokensFrom(css).dark).toEqual({ "gray-0.5": "#111111" });
  });
});
