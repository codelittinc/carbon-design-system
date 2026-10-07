import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Issue #25: `bg-warning-soft` and `text-warning-text` compiled to nothing,
 * because warning was the one status with no adaptive tokens. Tailwind emits no
 * class for an undefined token and raises no error, so only a test sees it.
 * Lives in `test/` because it reads theme.css from disk (see
 * category-tokens.test.ts).
 */
const themeCss = readFileSync(resolve(process.cwd(), "src/styles/theme.css"), "utf8");

/** The body of the block that starts at `opener`, up to its closing brace. */
function block(opener: string): string {
  const start = themeCss.indexOf(opener);
  expect(start, `${opener} block not found`).toBeGreaterThanOrEqual(0);
  const rest = themeCss.slice(start + opener.length);
  return rest.slice(0, rest.indexOf("\n}"));
}

const STATUSES = ["success", "error", "warning", "info"] as const;
const ADAPTIVE = ["text", "soft", "border"] as const;

describe("status tokens", () => {
  it.each(["@theme {", ".light {", ".dark {"])(
    "%s defines -text, -soft and -border for every status",
    (opener) => {
      const body = block(opener);
      for (const status of STATUSES) {
        for (const suffix of ADAPTIVE) {
          expect(body).toContain(`--color-${status}-${suffix}:`);
        }
      }
    },
  );

  it("defines -muted once for every status, like the base colours", () => {
    const base = block("@theme {");
    for (const status of STATUSES) {
      expect(base).toContain(`--color-${status}-muted:`);
      expect(themeCss.split(`--color-${status}-muted:`)).toHaveLength(2);
    }
  });
});
