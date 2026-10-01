import { describe, expect, it } from "vitest";
import {
  CATEGORICAL_PALETTE,
  MAX_CHIP_SEGMENTS,
  NEUTRAL_CATEGORICAL_COLOR,
  OVERFLOW_SEGMENT_COLOR,
  getCategoricalColor,
  getCategoricalSegments,
} from "../categorical-colors";

describe("CATEGORICAL_PALETTE", () => {
  it("references eleven category tokens in order", () => {
    expect(CATEGORICAL_PALETTE).toHaveLength(11);
    expect(CATEGORICAL_PALETTE[0]).toBe("var(--color-category-1)");
    expect(CATEGORICAL_PALETTE[10]).toBe("var(--color-category-11)");
  });
});

describe("getCategoricalColor", () => {
  it("is deterministic and cycles through the palette", () => {
    expect(getCategoricalColor(0)).toBe(CATEGORICAL_PALETTE[0]);
    expect(getCategoricalColor(3)).toBe(getCategoricalColor(3));
    expect(getCategoricalColor(11)).toBe(CATEGORICAL_PALETTE[0]);
    expect(getCategoricalColor(12)).toBe(CATEGORICAL_PALETTE[1]);
  });

  it("handles negative ids", () => {
    expect(getCategoricalColor(-1)).toBe(CATEGORICAL_PALETTE[10]);
  });
});

describe("getCategoricalSegments", () => {
  it("gives one neutral segment for no ids", () => {
    expect(getCategoricalSegments([])).toEqual([{ color: NEUTRAL_CATEGORICAL_COLOR }]);
  });

  it("gives one segment per id up to the cap", () => {
    expect(getCategoricalSegments([1, 2, 3, 4])).toEqual(
      [1, 2, 3, 4].map((id) => ({ color: getCategoricalColor(id) })),
    );
  });

  it("folds the rest into an overflow segment past the cap", () => {
    const segments = getCategoricalSegments([1, 2, 3, 4, 5, 6]);
    expect(segments).toHaveLength(MAX_CHIP_SEGMENTS);
    expect(segments[2]).toEqual({ color: getCategoricalColor(3) });
    expect(segments[3]).toEqual({ color: OVERFLOW_SEGMENT_COLOR, overflowCount: 3 });
  });
});
