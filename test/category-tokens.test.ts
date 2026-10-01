import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  CATEGORICAL_PALETTE,
  NEUTRAL_CATEGORICAL_COLOR,
  OVERFLOW_SEGMENT_COLOR,
} from "../src/lib/categorical-colors";

/**
 * The categorical constants are `var(--color-category-*)` strings, so a typo or
 * a renamed token fails silently — the fill just computes to nothing. Lives in
 * `test/` because it reads theme.css from disk (see dist-client-boundary.test.ts
 * for why that rules out `src/**​/__tests__/`).
 */
const themeCss = readFileSync(resolve(process.cwd(), "src/styles/theme.css"), "utf8");

describe("category tokens", () => {
  it("defines every token the constants point at", () => {
    const names = [...CATEGORICAL_PALETTE, NEUTRAL_CATEGORICAL_COLOR, OVERFLOW_SEGMENT_COLOR].map(
      (v) => v.slice("var(".length, -1),
    );
    for (const name of names) expect(themeCss).toContain(`${name}:`);
  });

  it("defines them once, so they do not change with the theme", () => {
    // A `.light` override would give an entity a different color depending on
    // who is looking at it.
    for (const name of ["--color-category-1:", "--color-category-overflow:"]) {
      expect(themeCss.split(name)).toHaveLength(2);
    }
  });
});
