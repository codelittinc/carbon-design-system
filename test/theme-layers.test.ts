import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// In test/ rather than src/**/__tests__/ because it needs Node APIs, which the
// typecheck (src only, no @types/node) does not cover. See dist-client-boundary.
const css = readFileSync(resolve(__dirname, "../src/styles/theme.css"), "utf8");

/** The top-level statements of a stylesheet: their prelude, comments removed. */
function topLevelPreludes(source: string): string[] {
  const text = source.replace(/\/\*[\s\S]*?\*\//g, "");
  const preludes: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "{") {
      if (depth === 0) preludes.push(text.slice(start, i).trim());
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0) start = i + 1;
    } else if (ch === ";" && depth === 0) {
      start = i + 1;
    }
  }
  return preludes;
}

describe("theme.css cascade layers", () => {
  // Unlayered CSS beats every layered rule regardless of specificity, and
  // Tailwind's utilities are layered. A bare `* { border-color }` once made
  // `border-error` and `border-accent` render gray everywhere.
  it("puts every rule that styles elements inside a cascade layer", () => {
    const allowed = /^(@theme|@layer\b|\.light$|\.dark$)/;
    const unlayered = topLevelPreludes(css).filter((p) => !allowed.test(p));
    expect(unlayered).toEqual([]);
  });

  it("keeps the base reset and the helper classes in their layers", () => {
    const preludes = topLevelPreludes(css);
    expect(preludes).toContain("@layer base");
    expect(preludes).toContain("@layer components");
  });
});
