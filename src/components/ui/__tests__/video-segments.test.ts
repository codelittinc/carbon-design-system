import { describe, expect, it } from "vitest";
import { createSegmentTracker } from "../video-segments";

/** Plays from `from` to `to` in `step`-second timeupdates, collecting what is reported. */
function play(tracker: ReturnType<typeof createSegmentTracker>, from: number, to: number, step = 0.25, rate = 1) {
  const out = [];
  for (let t = from + step; t <= to + 1e-9; t += step) {
    const s = tracker.tick(Math.round(t * 1000) / 1000, rate);
    if (s) out.push(s);
  }
  return out;
}

describe("createSegmentTracker", () => {
  it("reports a stretch every `everySeconds` while playing", () => {
    const tracker = createSegmentTracker({ everySeconds: 15 });
    expect(tracker.play(0)).toBeNull();
    expect(play(tracker, 0, 31)).toEqual([
      { start: 0, end: 15 },
      { start: 15, end: 30 },
    ]);
    expect(tracker.pause(31)).toEqual({ start: 30, end: 31 });
  });

  it("closes the stretch before a seek and never reports what was skipped", () => {
    const tracker = createSegmentTracker();
    tracker.play(0);
    play(tracker, 0, 5);
    expect(tracker.seek(60)).toEqual({ start: 0, end: 5 });
    play(tracker, 60, 64);
    expect(tracker.pause(64)).toEqual({ start: 60, end: 64 });
  });

  it("reports the open stretch on pause, rounded to a tenth", () => {
    const tracker = createSegmentTracker();
    tracker.play(1.03);
    play(tracker, 1.03, 7.2, 0.25);
    expect(tracker.pause(7.24)).toEqual({ start: 1, end: 7.2 });
  });

  it("drops a stretch under half a second", () => {
    const tracker = createSegmentTracker();
    tracker.play(10);
    tracker.tick(10.25);
    expect(tracker.pause(10.3)).toBeNull();
  });

  it("treats a forward jump with no seek event as a seek", () => {
    const tracker = createSegmentTracker();
    tracker.play(0);
    play(tracker, 0, 4);
    expect(tracker.tick(40)).toEqual({ start: 0, end: 4 });
    play(tracker, 40, 45);
    expect(tracker.pause(45)).toEqual({ start: 40, end: 45 });
  });

  it("treats a backward jump as a seek too", () => {
    const tracker = createSegmentTracker();
    tracker.play(30);
    play(tracker, 30, 34);
    expect(tracker.tick(10)).toEqual({ start: 30, end: 34 });
  });

  it("counts media time at a faster rate", () => {
    const tracker = createSegmentTracker({ everySeconds: 100 });
    tracker.play(0);
    // 2x: each 0.25 s of wall time moves the playhead 0.5 s, and a 1 s step is still playback.
    expect(play(tracker, 0, 8, 1, 2)).toEqual([]);
    expect(tracker.pause(8)).toEqual({ start: 0, end: 8 });
  });

  it("flushes without stopping, and carries on from there", () => {
    const tracker = createSegmentTracker();
    tracker.play(0);
    play(tracker, 0, 6);
    expect(tracker.flush(6)).toEqual({ start: 0, end: 6 });
    play(tracker, 6, 9);
    expect(tracker.pause(9)).toEqual({ start: 6, end: 9 });
  });

  it("reports nothing while paused", () => {
    const tracker = createSegmentTracker();
    expect(tracker.tick(5)).toBeNull();
    expect(tracker.seek(50)).toBeNull();
    expect(tracker.flush(50)).toBeNull();
    expect(tracker.pause(50)).toBeNull();
  });

  it("a second play closes a stretch left open", () => {
    const tracker = createSegmentTracker();
    tracker.play(0);
    play(tracker, 0, 3);
    expect(tracker.play(3)).toEqual({ start: 0, end: 3 });
  });
});
