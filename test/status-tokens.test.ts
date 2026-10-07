import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
// The token generator's theme.css reader. test/ is outside tsconfig's include, so not type-checked.
import { themeBlocks } from "../scripts/generate-tokens.mjs";

/**
 * Issue #25: `bg-warning-soft` and `text-warning-text` compiled to nothing,
 * because warning was the one status with no adaptive tokens. Tailwind emits no
 * class for an undefined token and raises no error, so only a test sees it.
 * Lives in `test/` because it reads theme.css from disk (see
 * category-tokens.test.ts).
 */
const themeCss = readFileSync(resolve(process.cwd(), "src/styles/theme.css"), "utf8");

const blocks = themeBlocks(themeCss) as Record<string, [string, string][]>;
/** The `--color-*` token names a theme block declares directly. */
const names = (block: string) => new Set(blocks[block].map(([name]) => name));
const declaredCount = (name: string) =>
  Object.values(blocks).flat().filter(([declared]) => declared === name).length;

const STATUSES = ["success", "error", "warning", "info"] as const;
const ADAPTIVE = ["text", "soft", "border"] as const;

describe("status tokens", () => {
  it.each(["theme", "light", "dark"])(
    "%s defines -text, -soft and -border for every status",
    (block) => {
      const declared = names(block);
      for (const status of STATUSES) {
        for (const suffix of ADAPTIVE) {
          expect(declared, `--color-${status}-${suffix}`).toContain(`${status}-${suffix}`);
        }
      }
    },
  );

  it("defines -muted once for every status, like the base colours", () => {
    const base = names("theme");
    for (const status of STATUSES) {
      expect(base).toContain(`${status}-muted`);
      expect(declaredCount(`${status}-muted`), `--color-${status}-muted`).toBe(1);
    }
  });
});
