import { describe, expect, it } from "vitest";
import { wrapLabel, wrappedLineCount } from "../wrap-label";

describe("wrapLabel", () => {
  it("keeps a label that fits on one line", () => {
    expect(wrapLabel("Operations", 12, 3)).toEqual(["Operations"]);
  });

  it("breaks on spaces, never inside a word that fits", () => {
    expect(wrapLabel("Property Management Team", 12, 3)).toEqual(["Property", "Management", "Team"]);
    expect(wrapLabel("1. Watch the intro", 10, 3)).toEqual(["1. Watch", "the intro"]);
  });

  it("ends the last line in an ellipsis past the line limit, within the width", () => {
    expect(wrapLabel("one two three four five six", 7, 2)).toEqual(["one two", "three…"]);
    expect(wrapLabel("abcdefg hijklmn opqrstu", 7, 2)).toEqual(["abcdefg", "hijklm…"]);
  });

  it("splits a word longer than a line rather than cutting it mid-label", () => {
    expect(wrapLabel("Internationalization rollout", 8, 4)).toEqual(["Internat", "ionaliza", "tion", "rollout"]);
  });

  it("never returns a line wider than maxChars", () => {
    for (const width of [1, 2, 5]) {
      for (const line of wrapLabel("Operations and maintenance", width, 2)) {
        expect(line.length).toBeLessThanOrEqual(width);
      }
    }
  });

  it("returns one empty line for blank text", () => {
    expect(wrapLabel("   ", 10, 3)).toEqual([""]);
  });
});

describe("wrappedLineCount", () => {
  it("reserves one line when every label fits, however many words", () => {
    expect(wrappedLineCount(["Mon 12 Oct", "Tue 13 Oct"], 20, 3)).toBe(1);
  });

  it("reserves the longest label's lines, up to the limit", () => {
    expect(wrappedLineCount(["IT", "Property Management Team"], 12, 3)).toBe(3);
    expect(wrappedLineCount(["a b c d e f g h"], 1, 3)).toBe(3);
  });
});
