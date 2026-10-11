/**
 * Which stretches of a video somebody actually played — the bookkeeping behind
 * `VideoViewer`'s `onSegment`, kept free of React and the DOM so it can be
 * tested on its own and reused by anything that drives a media element.
 *
 * A segment is `[start, end)` in media seconds, played without a seek inside
 * it. Seeking closes the open stretch before the jump, so skipping ahead is
 * never reported as watched. Times are rounded to a tenth of a second.
 */
export interface VideoSegment {
  /** Seconds, inclusive start of a stretch the viewer actually played. */
  start: number;
  /** Seconds, exclusive end. Always greater than `start`. */
  end: number;
}

export interface SegmentTrackerOptions {
  /** An open stretch is reported once it is this long, and a new one starts. Default 15. */
  everySeconds?: number;
  /** Shorter stretches are dropped. Default 0.5. */
  minSeconds?: number;
  /**
   * A `timeupdate` that moves further than this (times the playback rate)
   * since the last one is a seek the browser did not announce. Default 2.
   */
  jumpSeconds?: number;
}

export interface SegmentTracker {
  /** Playback started (or resumed) at `t`. Closes any stretch still open. */
  play(t: number): VideoSegment | null;
  /** A `timeupdate` at `t`, playing at `rate`. */
  tick(t: number, rate?: number): VideoSegment | null;
  /** The playhead moved to `to` by a seek. Closes the open stretch where it was. */
  seek(to: number): VideoSegment | null;
  /** Playback stopped at `t` (pause, end, the source changing). */
  pause(t: number): VideoSegment | null;
  /** Report the open stretch up to `t` now, and keep playing (page hidden). */
  flush(t: number): VideoSegment | null;
}

const BACKWARD_TOLERANCE = 0.25;

function round(t: number): number {
  return Math.round(t * 10) / 10;
}

export function createSegmentTracker(options: SegmentTrackerOptions = {}): SegmentTracker {
  const everySeconds = options.everySeconds ?? 15;
  const minSeconds = options.minSeconds ?? 0.5;
  const jumpSeconds = options.jumpSeconds ?? 2;

  let playing = false;
  let start: number | null = null;
  let last: number | null = null;

  const close = (from: number | null, to: number | null): VideoSegment | null => {
    if (from === null || to === null || !Number.isFinite(from) || !Number.isFinite(to)) return null;
    if (to - from < minSeconds) return null;
    return { start: round(from), end: round(to) };
  };

  /** Whether `t` is ordinary playback from `last`, rather than a jump. */
  const continues = (t: number, rate: number) =>
    last !== null && t >= last - BACKWARD_TOLERANCE && t <= last + jumpSeconds * Math.max(rate, 1);

  return {
    play(t) {
      const segment = playing ? close(start, last) : null;
      playing = true;
      start = t;
      last = t;
      return segment;
    },

    tick(t, rate = 1) {
      if (!playing || start === null) {
        last = t;
        return null;
      }
      if (!continues(t, rate)) {
        const segment = close(start, last);
        start = t;
        last = t;
        return segment;
      }
      last = Math.max(last ?? t, t);
      if (last - start >= everySeconds) {
        const segment = close(start, last);
        start = last;
        return segment;
      }
      return null;
    },

    seek(to) {
      const segment = playing ? close(start, last) : null;
      start = playing ? to : null;
      last = to;
      return segment;
    },

    pause(t) {
      if (!playing) {
        last = t;
        return null;
      }
      const end = continues(t, 1) ? Math.max(last ?? t, t) : last;
      const segment = close(start, end);
      playing = false;
      start = null;
      last = t;
      return segment;
    },

    flush(t) {
      if (!playing || start === null) return null;
      const end = continues(t, 1) ? Math.max(last ?? t, t) : last;
      const segment = close(start, end);
      if (segment) start = end;
      last = end;
      return segment;
    },
  };
}
