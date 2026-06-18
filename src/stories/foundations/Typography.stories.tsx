import type { Meta, StoryObj } from "@storybook/react";

/**
 * Three typefaces carry the system: Instrument Serif for display headings, DM Sans for body
 * and UI, and JetBrains Mono for numerals and code. Monospace numerals use `tabular-nums` so
 * financial columns align to the decimal.
 */
const meta: Meta = {
  title: "Foundations/Typography",
  parameters: { layout: "fullscreen" },
};
export default meta;

function Row({ label, token, children }: { label: string; token: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[160px_1fr] items-baseline gap-6 border-b border-border-subtle py-5">
      <div>
        <div className="text-sm font-medium text-text-primary">{label}</div>
        <div className="mt-0.5 font-mono text-xs text-text-muted">{token}</div>
      </div>
      <div>{children}</div>
    </div>
  );
}

export const Typefaces: StoryObj = {
  render: () => (
    <div className="min-h-screen bg-bg p-8">
      <h1 className="mb-2 font-display text-3xl text-text-primary">Typography</h1>
      <p className="mb-8 max-w-2xl text-sm text-text-muted">
        Display for moments, body for everything, mono for numbers.
      </p>

      <section className="mb-10">
        <h2 className="mb-2 text-lg font-semibold text-text-primary">Families</h2>
        <Row label="Display" token="font-display">
          <p className="font-display text-3xl text-text-primary">Instrument Serif</p>
          <p className="mt-1 text-xs text-text-muted">Page titles and editorial moments.</p>
        </Row>
        <Row label="Body / UI" token="font-body">
          <p className="font-body text-xl text-text-primary">DM Sans — the quick brown fox</p>
          <p className="mt-1 text-xs text-text-muted">Default for all UI and body copy.</p>
        </Row>
        <Row label="Mono" token="font-mono">
          <p className="font-mono text-xl text-text-primary">JetBrains Mono 0123456789</p>
          <p className="mt-1 text-xs text-text-muted">Numerals, amounts, code, identifiers.</p>
        </Row>
      </section>

      <section className="mb-10">
        <h2 className="mb-2 text-lg font-semibold text-text-primary">Type scale</h2>
        <Row label="Display" token="text-3xl · display">
          <span className="font-display text-3xl text-text-primary">Trial Balance</span>
        </Row>
        <Row label="Heading" token="text-lg · semibold">
          <span className="text-lg font-semibold text-text-primary">Section heading</span>
        </Row>
        <Row label="Body" token="text-sm">
          <span className="text-sm text-text-primary">Body text — the default size for dense UIs.</span>
        </Row>
        <Row label="Small" token="text-xs">
          <span className="text-xs text-text-secondary">Secondary metadata and helper text.</span>
        </Row>
        <Row label="Micro" token="text-[11px]">
          <span className="text-[11px] text-text-muted">Badges and the smallest labels.</span>
        </Row>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-text-primary">Tabular numerals</h2>
        <p className="mb-3 text-sm text-text-muted">
          The <code className="font-mono text-text-secondary">.tabular-nums</code> utility renders
          mono numerals that align to the decimal — essential for ledgers.
        </p>
        <div className="inline-block rounded-lg border border-border bg-surface p-4">
          <table>
            <tbody>
              {["1,250.00", "84,000.00", "(3.50)", "9,999,999.99"].map((n) => (
                <tr key={n}>
                  <td className="py-1 pr-8 text-sm text-text-secondary">Amount</td>
                  <td className="tabular-nums py-1 text-right text-text-primary">{n}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  ),
};
