import { defineConfig } from "tsup";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Library build for @codelittinc/carbon-design-system.
 *
 * Emits ESM + type declarations to dist/. Two entry points:
 *   - index  → the full barrel (@codelittinc/carbon-design-system)
 *   - button → the Button subpath (@codelittinc/carbon-design-system/button)
 *
 * tsup automatically treats everything in `dependencies` / `peerDependencies`
 * as external, so React and the UI libs are not bundled — the consumer supplies
 * them. The `@/` path alias resolves via tsconfig.json.
 */
const DIST = "dist";
const DIRECTIVE = '"use client";';

export default defineConfig({
  entry: {
    index: "src/index.ts",
    button: "src/components/ui/button.tsx",
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
   * banner is stripped the same way). Every entry point here is a React client
   * component, so we re-add the directive to each emitted JS file — otherwise
   * Next.js / RSC bundlers would try to render these on the server.
   */
  async onSuccess() {
    const files = (await readdir(DIST)).filter((f) => f.endsWith(".js"));
    await Promise.all(
      files.map(async (file) => {
        const path = join(DIST, file);
        const code = await readFile(path, "utf8");
        if (code.startsWith(DIRECTIVE)) return;
        await writeFile(path, `${DIRECTIVE}\n${code}`);
      }),
    );
  },
});
