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

/** Why a file may break a rule, and which of the rule's tags it may use. */
interface Allowance {
  why: string;
  /**
   * The tags (the pattern's first capture: `table`, `option`, …) the file may
   * use. Any other match still fails, so an allowance for one element is not a
   * licence for every raw control in the file.
   */
  tags: string[];
}

interface Rule {
  name: string;
  /** Its first capture group is the tag an allowance is keyed by. */
  pattern: RegExp;
  allow: Record<string, Allowance>;
}

const TABLE_TAGS = ["table", "thead", "tbody", "tfoot", "tr", "th", "td"];

const RULES: Rule[] = [
  {
    name: "raw control or table element",
    // `table` too: tables are built from `Table` and its parts (table.tsx), the
    // one place the raw elements are styled.
    pattern: /<(button|select|textarea|input|table|thead|tbody|tfoot|tr|th|td)\b(?![^>]*type="hidden")/g,
    allow: {
      input: { why: "the Input primitive", tags: ["input"] },
      textarea: { why: "the Textarea primitive", tags: ["textarea"] },
      table: { why: "the Table primitives", tags: TABLE_TAGS },
      chart: {
        why: "ChartDataTable is visually hidden, so Table's styling would be wasted",
        tags: ["table", "thead", "tbody", "tr", "th", "td"],
      },
      "rich-text-image-button": { why: "the image upload's hidden file input", tags: ["input"] },
      "search-select": { why: COMBOBOX_REWRITE, tags: ["button", "input"] },
      "account-combobox": { why: COMBOBOX_REWRITE, tags: ["button"] },
    },
  },
  {
    name: "raw <label>",
    pattern: /<(label)\b/g,
    allow: { label: { why: "the Label primitive", tags: ["label"] } },
  },
  {
    name: "hand-rolled role",
    pattern: /role="(option|button|dialog)"/g,
    allow: {
      "search-select": { why: COMBOBOX_REWRITE, tags: ["option", "button"] },
      "multi-select": { why: COMBOBOX_REWRITE, tags: ["option"] },
      "account-combobox": { why: COMBOBOX_REWRITE, tags: ["option"] },
      "address-combobox": { why: COMBOBOX_REWRITE, tags: ["option"] },
      "command-palette": {
        why: "hand-rolled modal: moves onto Dialog (or cmdk's Command.Dialog) in 2.0 (audit Tier B #13)",
        tags: ["dialog"],
      },
    },
  },
  {
    name: "document mousedown listener (hand-rolled outside click)",
    pattern: /document\.addEventListener\("(mousedown)"/g,
    allow: {
      "search-select": { why: COMBOBOX_REWRITE, tags: ["mousedown"] },
      "multi-select": { why: COMBOBOX_REWRITE, tags: ["mousedown"] },
    },
  },
  {
    name: "full-screen overlay outside the dialog primitives",
    // The dialog primitives draw theirs from `overlayClass` in lib/ui-classes.
    pattern: /(fixed inset-0)/g,
    allow: {
      "command-palette": {
        why: "hand-rolled modal: moves onto Dialog (or cmdk's Command.Dialog) in 2.0 (audit Tier B #13)",
        tags: ["fixed inset-0"],
      },
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

/** Each match's tag: the pattern's first capture. */
function tagsIn(text: string, pattern: RegExp): string[] {
  return Array.from(text.matchAll(pattern), (match) => match[1]);
}

/** The matches in `text` that its allowance (if any) does not cover. */
function violations(text: string, rule: Rule, name: string): string[] {
  const allowed = rule.allow[name]?.tags ?? [];
  return tagsIn(text, rule.pattern).filter((tag) => !allowed.includes(tag));
}

describe("components composed from design-system parts", () => {
  it("finds the component files", () => {
    expect(COMPONENTS.length).toBeGreaterThan(50);
  });

  for (const rule of RULES) {
    describe(rule.name, () => {
      it.each(COMPONENTS)("%s uses none outside its allowance", (name) => {
        expect(violations(source(name), rule, name)).toEqual([]);
      });

      // An allowance that is no longer needed is removed, so the file is
      // checked again from then on; the same goes for each tag in it.
      it.each(Object.keys(rule.allow))("%s still needs each tag of its allowance", (name) => {
        expect(COMPONENTS).toContain(name);
        const used = new Set(tagsIn(source(name), rule.pattern));
        expect(rule.allow[name].tags.filter((tag) => !used.has(tag))).toEqual([]);
      });
    });
  }

  it("an allowance for one tag does not cover another in the same file", () => {
    const rule = RULES[0];
    // chart.tsx may draw a raw <table>, but not a raw <button>.
    const withButton = `${source("chart")}\n<button type="button">Toggle</button>`;
    expect(violations(source("chart"), rule, "chart")).toEqual([]);
    expect(violations(withButton, rule, "chart")).toEqual(["button"]);
  });
});
