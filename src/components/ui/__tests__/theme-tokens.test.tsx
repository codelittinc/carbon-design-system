import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AccountCombobox } from "../account-combobox";
import { MultiStatusFilter } from "../multi-status-filter";
import { Badge } from "../badge";

/**
 * Guards against issue #15: compiled components must not ship fixed Tailwind
 * palette utilities (text-amber-400, bg-green-500/15, …). Those colors do not
 * follow the consumer's semantic theme tokens, so they fail WCAG AA when a
 * light theme flips the surfaces. Components must use semantic tokens
 * (text-accent-text, bg-success-soft, ring-accent/50, …) which the theme remaps
 * per mode.
 *
 * jsdom does not apply Tailwind stylesheets, so contrast cannot be measured
 * here. Instead we assert the *class strings* never reintroduce a fixed palette
 * utility — both by scanning the source of the theme-critical components and by
 * inspecting the rendered DOM.
 */

// Named Tailwind color ramps. `carbon` (the foundation scale) and the semantic
// token names (accent, success, error, info, surface, text, border) are allowed;
// everything below is a fixed palette that bypasses the theme.
const FIXED_PALETTE =
  "amber|emerald|green|red|blue|slate|gray|zinc|neutral|yellow|orange|rose|pink|purple|indigo|cyan|teal|lime|sky|violet|fuchsia|stone";

// Matches e.g. `text-amber-400`, `bg-green-500/15`, `focus:ring-amber-500/50`,
// `data-[state=checked]:bg-amber-500` — a color ramp with a numeric shade used
// as a utility value (optionally with a variant prefix and opacity suffix).
const fixedPaletteUtility = new RegExp(
  `(?:^|[\\s"'\`:\\[])(?:text|bg|border|ring|fill|from|to|via|caret|placeholder|decoration|outline|divide|accent|shadow)-(?:${FIXED_PALETTE})-\\d`,
);

// Raw source of every sibling component, keyed by "<name>.tsx", loaded at build
// time by Vite so the scan needs no filesystem access.
const COMPONENT_SOURCES = import.meta.glob("../*.tsx", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function sourceOf(name: string): string {
  const src = COMPONENT_SOURCES[`../${name}`];
  if (src == null) throw new Error(`Could not load source for ${name}`);
  return src;
}

/**
 * Theme-aware components whose entire surface must use semantic tokens. The
 * address components' `public`/`vendor` variants are intentionally excluded:
 * they render into fixed, theme-independent embedded contexts (a public form,
 * a vendor portal) and pin their own gray/white color scheme by design.
 */
const THEME_CRITICAL = [
  "account-combobox.tsx",
  "multi-status-filter.tsx",
  "badge.tsx",
  "data-table.tsx",
  "tabs.tsx",
  "progress.tsx",
  "switch.tsx",
  "checkbox.tsx",
  "search-select.tsx",
  "toast.tsx",
];

describe("no fixed palette utilities in theme-critical components", () => {
  it.each(THEME_CRITICAL)("%s uses only semantic tokens", (file) => {
    const src = sourceOf(file);
    const offenders = src
      .split("\n")
      .map((line, i) => [i + 1, line] as const)
      .filter(([, line]) => fixedPaletteUtility.test(line));

    expect(
      offenders,
      `Fixed palette utilities found (use semantic tokens instead):\n` +
        offenders.map(([n, line]) => `  ${file}:${n}  ${line.trim()}`).join("\n"),
    ).toEqual([]);
  });
});

describe("rendered DOM carries no fixed palette utilities", () => {
  it("AccountCombobox", () => {
    const { container } = render(
      <AccountCombobox
        accounts={[
          { id: "1", accountNumber: "1-5730", name: "Prepaid Rent" },
          { id: "2", accountNumber: "1-6000", name: "Office Supplies" },
        ]}
        value="1"
        onChange={() => {}}
      />,
    );
    // combobox role is exposed for a11y
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expectNoFixedPalette(container);
  });

  it("MultiStatusFilter", () => {
    const { container } = render(
      <MultiStatusFilter
        options={[
          { value: "open", label: "Open" },
          { value: "closed", label: "Closed" },
        ]}
        selected={["open"]}
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: /status filter/i })).toBeInTheDocument();
    expectNoFixedPalette(container);
  });

  it("Badge variants", () => {
    const { container } = render(
      <div>
        <Badge variant="accent">accent</Badge>
        <Badge variant="success">success</Badge>
        <Badge variant="warning">warning</Badge>
        <Badge variant="error">error</Badge>
        <Badge variant="info">info</Badge>
      </div>,
    );
    expectNoFixedPalette(container);
  });
});

function expectNoFixedPalette(container: HTMLElement) {
  const offenders: string[] = [];
  container.querySelectorAll<HTMLElement>("[class]").forEach((el) => {
    // SVG elements expose className as an object, so read the attribute directly.
    (el.getAttribute("class") ?? "")
      .split(/\s+/)
      .filter((c) => fixedPaletteUtility.test(` ${c}`))
      .forEach((c) => offenders.push(c));
  });
  expect(
    Array.from(new Set(offenders)),
    `Rendered DOM contains fixed palette utilities: ${offenders.join(", ")}`,
  ).toEqual([]);
}
