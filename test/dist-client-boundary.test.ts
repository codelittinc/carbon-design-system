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

  it("leaves the utils entry callable from a server component", () => {
    expect(distFile("utils.js").startsWith(DIRECTIVE)).toBe(false);
  });

  it("exports cn and the formatters from the utils entry", async () => {
    const utils = await import("../src/utils");
    expect(typeof utils.cn).toBe("function");
    expect(typeof utils.formatMoney).toBe("function");
    expect(typeof utils.formatDate).toBe("function");
    expect(typeof utils.formatPeriodLabel).toBe("function");
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
