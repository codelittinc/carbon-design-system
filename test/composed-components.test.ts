import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// In test/ rather than src/**/__tests__/ because it reads source files with
// Node APIs, which the typecheck (src only, no @types/node) does not cover.

/**
 * Components compose the design system's own parts (`Button`, `Input`,
 * `Label`, `Table`, the Radix-based `Dialog`, …) rather than styling raw
 * elements, so they pick up those parts' focus rings, disabled states, names
 * and fixes. Every component file is checked; a file that must render a raw
 * element is listed against the rule it breaks, with the reason.
 */

const UI_DIR = resolve(__dirname, "../src/components/ui");

/** Every component file, stories aside. */
const COMPONENTS = readdirSync(UI_DIR)
  .filter((file) => file.endsWith(".tsx") && !file.endsWith(".stories.tsx"))
  .map((file) => file.replace(/\.tsx$/, ""))
  .sort();

/** Hand-rolled comboboxes, until the shared `useListbox` + Popover rewrite. */
const COMBOBOX_REWRITE =
  "hand-rolled combobox: moves onto the shared useListbox hook and a Radix Popover panel in the 2.0 combobox rewrite (audit Tier B #12)";

interface Rule {
  name: string;
  pattern: RegExp;
  /** File → why it may break the rule. */
  allow: Record<string, string>;
}

const RULES: Rule[] = [
  {
    name: "raw control or table element",
    // `table` too: tables are built from `Table` and its parts (table.tsx), the
    // one place the raw elements are styled.
    pattern: /<(button|select|textarea|input|table|thead|tbody|tfoot|tr|th|td)\b(?![^>]*type="hidden")/g,
    allow: {
      input: "the Input primitive",
      textarea: "the Textarea primitive",
      table: "the Table primitives",
      chart: "ChartDataTable is visually hidden, so Table's styling would be wasted",
      "rich-text-image-button": "the image upload's hidden file input",
      "search-select": COMBOBOX_REWRITE,
      "account-combobox": COMBOBOX_REWRITE,
    },
  },
  {
    name: "raw <label>",
    pattern: /<label\b/g,
    allow: { label: "the Label primitive" },
  },
  {
    name: "hand-rolled role",
    pattern: /role="(option|button|dialog)"/g,
    allow: {
      "search-select": COMBOBOX_REWRITE,
      "multi-select": COMBOBOX_REWRITE,
      "account-combobox": COMBOBOX_REWRITE,
      "address-combobox": COMBOBOX_REWRITE,
      "command-palette":
        "hand-rolled modal: moves onto Dialog (or cmdk's Command.Dialog) in 2.0 (audit Tier B #13)",
    },
  },
  {
    name: "document mousedown listener (hand-rolled outside click)",
    pattern: /document\.addEventListener\("mousedown"/g,
    allow: {
      "search-select": COMBOBOX_REWRITE,
      "multi-select": COMBOBOX_REWRITE,
    },
  },
  {
    name: "full-screen overlay outside the dialog primitives",
    // The dialog primitives draw theirs from `overlayClass` in lib/ui-classes.
    pattern: /fixed inset-0/g,
    allow: {
      "command-palette":
        "hand-rolled modal: moves onto Dialog (or cmdk's Command.Dialog) in 2.0 (audit Tier B #13)",
    },
  },
];

function source(name: string): string {
  return (
    readFileSync(resolve(UI_DIR, `${name}.tsx`), "utf8")
      // Comments may name a tag.
      .replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "")
  );
}

describe("components composed from design-system parts", () => {
  it("finds the component files", () => {
    expect(COMPONENTS.length).toBeGreaterThan(50);
  });

  for (const rule of RULES) {
    describe(rule.name, () => {
      it.each(COMPONENTS.filter((name) => !(name in rule.allow)))("%s has none", (name) => {
        expect(source(name).match(rule.pattern) ?? []).toEqual([]);
      });

      // An allowance that is no longer needed is removed, so the file is
      // checked again from then on.
      it.each(Object.keys(rule.allow))("%s still needs its allowance", (name) => {
        expect(COMPONENTS).toContain(name);
        expect(source(name).match(rule.pattern)).not.toBeNull();
      });
    });
  }
});
