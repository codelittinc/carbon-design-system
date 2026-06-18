import type { Meta, StoryObj } from "@storybook/react";

/**
 * The CarbonOS palette. Surfaces are built up from carbon blacks; amber is the single
 * brand accent; semantic colors are reserved for status. Every swatch below maps to a
 * Tailwind token generated from `src/styles/theme.css`.
 */
const meta: Meta = {
  title: "Foundations/Colors",
  parameters: { layout: "fullscreen" },
};
export default meta;

type Swatch = { name: string; value: string; varName: string };

const carbon: Swatch[] = [
  { name: "carbon-950", value: "#09090b", varName: "--color-carbon-950" },
  { name: "carbon-900", value: "#131316", varName: "--color-carbon-900" },
  { name: "carbon-850", value: "#18181b", varName: "--color-carbon-850" },
  { name: "carbon-800", value: "#1e1e22", varName: "--color-carbon-800" },
  { name: "carbon-700", value: "#2a2a30", varName: "--color-carbon-700" },
  { name: "carbon-600", value: "#3f3f46", varName: "--color-carbon-600" },
  { name: "carbon-500", value: "#52525b", varName: "--color-carbon-500" },
  { name: "carbon-400", value: "#71717a", varName: "--color-carbon-400" },
  { name: "carbon-300", value: "#a1a1aa", varName: "--color-carbon-300" },
  { name: "carbon-200", value: "#d4d4d8", varName: "--color-carbon-200" },
  { name: "carbon-100", value: "#e4e4e7", varName: "--color-carbon-100" },
  { name: "carbon-50", value: "#fafafa", varName: "--color-carbon-50" },
];

const amber: Swatch[] = [
  { name: "amber-900", value: "#451a03", varName: "--color-amber-900" },
  { name: "amber-700", value: "#b45309", varName: "--color-amber-700" },
  { name: "amber-600", value: "#d97706", varName: "--color-amber-600" },
  { name: "amber-500", value: "#f59e0b", varName: "--color-amber-500" },
  { name: "amber-400", value: "#fbbf24", varName: "--color-amber-400" },
  { name: "amber-300", value: "#fcd34d", varName: "--color-amber-300" },
];

const semantic: Swatch[] = [
  { name: "success", value: "#22c55e", varName: "--color-success" },
  { name: "success-muted", value: "#166534", varName: "--color-success-muted" },
  { name: "error", value: "#ef4444", varName: "--color-error" },
  { name: "error-muted", value: "#7f1d1d", varName: "--color-error-muted" },
  { name: "warning", value: "#eab308", varName: "--color-warning" },
  { name: "info", value: "#3b82f6", varName: "--color-info" },
];

const surfaces: Swatch[] = [
  { name: "bg", value: "#09090b", varName: "--color-bg" },
  { name: "surface", value: "#131316", varName: "--color-surface" },
  { name: "surface-raised", value: "#18181b", varName: "--color-surface-raised" },
  { name: "surface-overlay", value: "#1e1e22", varName: "--color-surface-overlay" },
  { name: "border", value: "#2a2a30", varName: "--color-border" },
  { name: "border-subtle", value: "#1f1f24", varName: "--color-border-subtle" },
];

const text: Swatch[] = [
  { name: "text-primary", value: "#fafafa", varName: "--color-text-primary" },
  { name: "text-secondary", value: "#a1a1aa", varName: "--color-text-secondary" },
  { name: "text-muted", value: "#71717a", varName: "--color-text-muted" },
  { name: "text-faint", value: "#52525b", varName: "--color-text-faint" },
];

function SwatchCard({ swatch }: { swatch: Swatch }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="h-16 w-full" style={{ backgroundColor: swatch.value }} />
      <div className="px-3 py-2">
        <div className="text-sm font-medium text-text-primary">{swatch.name}</div>
        <div className="mt-0.5 font-mono text-xs text-text-muted">{swatch.value}</div>
      </div>
    </div>
  );
}

function Group({ title, description, swatches }: { title: string; description: string; swatches: Swatch[] }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
      <p className="mb-4 mt-1 max-w-2xl text-sm text-text-muted">{description}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {swatches.map((s) => (
          <SwatchCard key={s.name} swatch={s} />
        ))}
      </div>
    </section>
  );
}

export const Palette: StoryObj = {
  render: () => (
    <div className="min-h-screen bg-bg p-8">
      <h1 className="mb-2 font-display text-3xl text-text-primary">Colors</h1>
      <p className="mb-8 max-w-2xl text-sm text-text-muted">
        Use the semantic tokens (surface, text, accent) in product code wherever possible — they
        carry intent and survive theme changes. Reach for raw palette steps only when no semantic
        token fits.
      </p>
      <Group
        title="Carbon"
        description="The neutral spine of the system. Surfaces and text are built from these steps."
        swatches={carbon}
      />
      <Group
        title="Amber accent"
        description="The single brand accent. Drives primary actions, active states, and focus rings."
        swatches={amber}
      />
      <Group
        title="Semantic"
        description="Reserved for status and feedback — never decoration."
        swatches={semantic}
      />
      <Group
        title="Surfaces (semantic)"
        description="Layered backgrounds and borders. Prefer these over raw carbon steps in UI code."
        swatches={surfaces}
      />
      <Group
        title="Text (semantic)"
        description="Text color hierarchy from primary headings down to faint hints."
        swatches={text}
      />
    </div>
  ),
};
