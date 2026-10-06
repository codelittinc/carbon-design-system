/**
 * Deterministic id → color identity, for an unbounded set of entities (a
 * project, a team) that each need a stable color. Colors are never stored or
 * sent over the wire: they are derived from the numeric id at render time.
 *
 * Every value is a CSS variable reference to a `--color-category-*` token in
 * theme.css, so it can go straight into a `style` (`backgroundColor`) or an SVG
 * `fill`. Those tokens are fills under WHITE text and all clear 4.5:1 against
 * it. They cycle and stay the same in both themes, which is what separates them
 * from the `chart-*` series slots (`seriesColor`): those never cycle and are
 * re-stepped per theme. The token block in theme.css has the full reasoning.
 *
 * Pure, no React — also exported from `/utils` for server components.
 */

/** Number of distinct fills before `getCategoricalColor` cycles. */
const PALETTE_SIZE = 11;

export const CATEGORICAL_PALETTE: readonly string[] = Array.from(
  { length: PALETTE_SIZE },
  (_, i) => `var(--color-category-${i + 1})`,
);

/** Fill for an item with no category. */
export const NEUTRAL_CATEGORICAL_COLOR = "var(--color-category-neutral)";

/** Fill for the capped "+N more" segment. */
export const OVERFLOW_SEGMENT_COLOR = "var(--color-category-overflow)";

/** Maximum number of color segments drawn on a `CategoryChip`. */
export const MAX_CHIP_SEGMENTS = 4;

/** The palette fill for an integer id. Cycles; negative ids are safe. */
export function getCategoricalColor(id: number): string {
  const index = ((id % PALETTE_SIZE) + PALETTE_SIZE) % PALETTE_SIZE;
  return CATEGORICAL_PALETTE[index];
}

export interface CategoricalSegment {
  color: string;
  /** Present only on the capped overflow segment: how many ids it stands for. */
  overflowCount?: number;
}

/**
 * Equal-width segments for a `CategoryChip`, from ids the caller has already
 * put in display order.
 *
 * - no ids → one neutral segment
 * - up to `MAX_CHIP_SEGMENTS` ids → one segment each
 * - more → the first `MAX_CHIP_SEGMENTS − 1`, then an overflow segment whose
 *   `overflowCount` is the rest
 */
export function getCategoricalSegments(ids: number[]): CategoricalSegment[] {
  if (ids.length === 0) return [{ color: NEUTRAL_CATEGORICAL_COLOR }];
  if (ids.length <= MAX_CHIP_SEGMENTS) {
    return ids.map((id) => ({ color: getCategoricalColor(id) }));
  }
  const visible = ids.slice(0, MAX_CHIP_SEGMENTS - 1);
  return [
    ...visible.map((id) => ({ color: getCategoricalColor(id) })),
    { color: OVERFLOW_SEGMENT_COLOR, overflowCount: ids.length - visible.length },
  ];
}
