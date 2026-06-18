import type { Meta, StoryObj } from "@storybook/react";

/**
 * A tighter-than-default spacing scale tuned for data-dense screens. Values are the same tokens
 * Tailwind uses for padding, margin, and gap utilities (p-2, gap-4, etc.).
 */
const meta: Meta = {
  title: "Foundations/Spacing",
  parameters: { layout: "fullscreen" },
};
export default meta;

const scale: { token: string; px: number }[] = [
  { token: "px", px: 1 },
  { token: "0.5", px: 2 },
  { token: "1", px: 4 },
  { token: "1.5", px: 6 },
  { token: "2", px: 8 },
  { token: "2.5", px: 10 },
  { token: "3", px: 12 },
  { token: "4", px: 16 },
  { token: "5", px: 20 },
  { token: "6", px: 24 },
  { token: "8", px: 32 },
  { token: "10", px: 40 },
  { token: "12", px: 48 },
  { token: "16", px: 64 },
  { token: "20", px: 80 },
];

export const Scale: StoryObj = {
  render: () => (
    <div className="min-h-screen bg-bg p-8">
      <h1 className="mb-2 font-display text-3xl text-text-primary">Spacing</h1>
      <p className="mb-8 max-w-2xl text-sm text-text-muted">
        One scale for padding, margins, and gaps. Reach for the small steps (1–3) inside dense
        components and the larger steps (6–20) for page-level rhythm.
      </p>
      <div className="space-y-2">
        {scale.map((s) => (
          <div key={s.token} className="flex items-center gap-6">
            <div className="w-20 font-mono text-sm text-text-secondary">{s.token}</div>
            <div className="w-16 font-mono text-xs text-text-muted">{s.px}px</div>
            <div className="h-4 rounded-sm bg-amber-500" style={{ width: s.px }} />
          </div>
        ))}
      </div>
    </div>
  ),
};
