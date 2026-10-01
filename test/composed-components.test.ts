import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// In test/ rather than src/**/__tests__/ because it reads source files with
// Node APIs, which the typecheck (src only, no @types/node) does not cover.

/**
 * Components that compose the design system's own controls (`Button`,
 * `Input`, …) rather than styling raw ones, so they pick up those components'
 * focus rings, disabled states and fixes. Add a component here once it has been
 * converted, so it stays converted.
 */
const COMPOSED = [
  "alert",
  "card",
  "label",
  "multi-select",
  "pagination",
  "segmented-control",
  "spinner",
  "tag",
];

const RAW_CONTROL = /<(button|select|textarea|input)\b(?![^>]*type="hidden")/g;

describe("components composed from design-system controls", () => {
  it.each(COMPOSED)("%s renders no raw control", (name) => {
    const source = readFileSync(resolve(__dirname, `../src/components/ui/${name}.tsx`), "utf8")
      // Comments may name a tag.
      .replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "");
    expect(source.match(RAW_CONTROL) ?? []).toEqual([]);
  });
});
