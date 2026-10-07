import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  CATEGORICAL_PALETTE,
  NEUTRAL_CATEGORICAL_COLOR,
  OVERFLOW_SEGMENT_COLOR,
} from "../src/lib/categorical-colors";
// The token generator's theme.css reader. test/ is outside tsconfig's include, so not type-checked.
import { themeBlocks } from "../scripts/generate-tokens.mjs";

/**
 * The categorical constants are `var(--color-category-*)` strings, so a typo or
 * a renamed token fails silently — the fill just computes to nothing. Lives in
 * `test/` because it reads theme.css from disk (see dist-client-boundary.test.ts
 * for why that rules out `src/**​/__tests__/`).
 */
const themeCss = readFileSync(resolve(process.cwd(), "src/styles/theme.css"), "utf8");
const blocks = themeBlocks(themeCss) as Record<string, [string, string][]>;
const declared = Object.values(blocks).flat().map(([name]) => `--color-${name}`);

describe("category tokens", () => {
  it("defines every token the constants point at", () => {
    const names = [...CATEGORICAL_PALETTE, NEUTRAL_CATEGORICAL_COLOR, OVERFLOW_SEGMENT_COLOR].map(
      (v) => v.slice("var(".length, -1),
    );
    for (const name of names) expect(declared).toContain(name);
  });

  it("defines them once, so they do not change with the theme", () => {
    // A `.light` override would give an entity a different color depending on
    // who is looking at it.
    for (const name of ["--color-category-1", "--color-category-overflow"]) {
      expect(declared.filter((d) => d === name), name).toHaveLength(1);
    }
  });

  it("are declared in an `@theme static` block, so Tailwind emits all of them", () => {
    // getCategoricalColor builds the names at runtime, which no source scan sees;
    // a plain @theme drops every one no class mentions.
    const body = blocks.static.map(([name]) => name);
    for (let i = 1; i <= CATEGORICAL_PALETTE.length; i++) expect(body).toContain(`category-${i}`);
    expect(body).toContain("category-overflow");
  });
});
