import { defineConfig } from "tsup";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Library build for @codelittinc/carbon-design-system.
 *
 * Emits ESM + type declarations to dist/. Two entry points:
 *   - index → the full barrel (@codelittinc/carbon-design-system)
 *   - utils → pure helpers only (@codelittinc/carbon-design-system/utils)
 *
 * tsup automatically treats everything in `dependencies` / `peerDependencies`
 * as external, so React and the UI libs are not bundled — the consumer supplies
 * them. The `@/` path alias resolves via tsconfig.json.
 */
const DIST = "dist";
const DIRECTIVE = '"use client";';

/**
 * Which emitted bundles are React client code, and which are safe to call from
 * a server component. `index` is client: it is almost entirely components, and
 * the directive has to cover them. `utils` must NOT be, which is the reason it
 * is a separate entry — see the comment in src/utils.ts.
 */
const CLIENT_ENTRIES = new Set(["index.js"]);
const SERVER_SAFE_ENTRIES = new Set(["utils.js"]);

export default defineConfig({
  entry: {
    index: "src/index.ts",
    utils: "src/utils.ts",
  },
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: false,
  splitting: false,
  treeshake: true,
  tsconfig: "tsconfig.json",
  /**
   * esbuild strips module-level "use client" directives when bundling (and a
   * banner is stripped the same way), so the directive is re-added here per
   * entry rather than being written in the source.
   *
   * This step asserts rather than just writes. Getting it wrong is invisible:
   * a missing directive on a client bundle and a stray one on `utils` both
   * typecheck, both build, and both only fail when a page renders. So an
   * unrecognised bundle fails the build instead of silently defaulting either
   * way — a new entry must be classified above deliberately.
   */
  async onSuccess() {
    const files = (await readdir(DIST)).filter((f) => f.endsWith(".js"));

    const unclassified = files.filter(
      (f) => !CLIENT_ENTRIES.has(f) && !SERVER_SAFE_ENTRIES.has(f),
    );
    if (unclassified.length > 0) {
      throw new Error(
        `tsup.config.ts: unclassified bundle(s) ${unclassified.join(", ")} — ` +
          `add each to CLIENT_ENTRIES or SERVER_SAFE_ENTRIES so it is clear ` +
          `whether "use client" belongs on it.`,
      );
    }

    await Promise.all(
      files.map(async (file) => {
        const path = join(DIST, file);
        const code = await readFile(path, "utf8");

        if (SERVER_SAFE_ENTRIES.has(file)) {
          if (code.startsWith(DIRECTIVE)) {
            throw new Error(
              `tsup.config.ts: ${file} is server-safe but carries the ` +
                `"use client" directive — its exports would become client ` +
                `references and throw when called during a server render.`,
            );
          }
          return;
        }

        if (code.startsWith(DIRECTIVE)) return;
        await writeFile(path, `${DIRECTIVE}\n${code}`);
      }),
    );
  },
});
