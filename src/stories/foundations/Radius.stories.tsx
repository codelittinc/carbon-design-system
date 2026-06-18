import type { Meta, StoryObj } from "@storybook/react";

/**
 * Corner radii. Small values keep dense controls crisp; larger values soften overlays and cards.
 * Tokens map to Tailwind's rounded-sm / rounded-md / rounded-lg / rounded-xl utilities.
 */
const meta: Meta = {
  title: "Foundations/Radius",
  parameters: { layout: "fullscreen" },
};
export default meta;

const radii: { token: string; cls: string; px: string; usage: string }[] = [
  { token: "sm", cls: "rounded-sm", px: "4px", usage: "Inputs, small chips" },
  { token: "md", cls: "rounded-md", px: "6px", usage: "Buttons, fields" },
  { token: "lg", cls: "rounded-lg", px: "8px", usage: "Cards, popovers, dialogs" },
  { token: "xl", cls: "rounded-xl", px: "12px", usage: "Large surfaces" },
  { token: "full", cls: "rounded-full", px: "9999px", usage: "Badges, avatars, switches" },
];

export const Radii: StoryObj = {
  render: () => (
    <div className="min-h-screen bg-bg p-8">
      <h1 className="mb-2 font-display text-3xl text-text-primary">Radius</h1>
      <p className="mb-8 max-w-2xl text-sm text-text-muted">
        A compact radius set — just enough softness for a carbon UI without rounding away the
        data-dense, technical feel.
      </p>
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
        {radii.map((r) => (
          <div key={r.token} className="text-center">
            <div
              className={`mx-auto h-24 w-24 border border-amber-500/40 bg-amber-500/15 ${r.cls}`}
            />
            <div className="mt-3 text-sm font-medium text-text-primary">{r.token}</div>
            <div className="font-mono text-xs text-text-muted">{r.px}</div>
            <div className="mt-1 text-xs text-text-faint">{r.usage}</div>
          </div>
        ))}
      </div>
    </div>
  ),
};
