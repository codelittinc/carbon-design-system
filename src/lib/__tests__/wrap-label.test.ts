import { describe, expect, it } from "vitest";
import { wrapLabel } from "../wrap-label";

describe("wrapLabel", () => {
  it("keeps a label that fits on one line", () => {
    expect(wrapLabel("Operations", 12, 3)).toEqual(["Operations"]);
  });

  it("breaks on spaces, never inside a word that fits", () => {
    expect(wrapLabel("Property Management Team", 12, 3)).toEqual(["Property", "Management", "Team"]);
    expect(wrapLabel("1. Watch the intro", 10, 3)).toEqual(["1. Watch", "the intro"]);
  });

  it("ends the last line in an ellipsis past the line limit", () => {
    expect(wrapLabel("one two three four five six", 7, 2)).toEqual(["one two", "three…"]);
  });

  it("shortens a single word longer than a line", () => {
    expect(wrapLabel("Internationalization", 8, 3)).toEqual(["Interna…"]);
  });

  it("returns one empty line for blank text", () => {
    expect(wrapLabel("   ", 10, 3)).toEqual([""]);
  });
});
