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
   * since the last one — beyond what the wall-clock time between them
   * explains, when the caller passes it — is a seek the browser did not
   * announce. Default 2.
   */
  jumpSeconds?: number;
}

export interface SegmentTracker {
  /** Playback started (or resumed) at `t`. Closes any stretch still open. */
  play(t: number): VideoSegment | null;
  /**
   * A `timeupdate` at `t`, playing at `rate`. `now` (ms, e.g. `performance.now()`)
   * lets a late `timeupdate` — a long task, a throttled tab — count as the
   * playback it was rather than as a jump.
   */
  tick(t: number, rate?: number, now?: number): VideoSegment | null;
  /** The playhead moved to `to` by a seek. Closes the open stretch where it was. */
  seek(to: number): VideoSegment | null;
  /** Playback stopped at `t` (pause, end, the source changing), playing at `rate`. */
  pause(t: number, rate?: number, now?: number): VideoSegment | null;
  /** Report the open stretch up to `t` now, and keep playing (page hidden). */
  flush(t: number, rate?: number, now?: number): VideoSegment | null;
}

const BACKWARD_TOLERANCE = 0.25;

function round(t: number): number {
  return Math.round(t * 10) / 10;
}

export function createSegmentTracker(options: SegmentTrackerOptions = {}): SegmentTracker {
  const minSeconds = options.minSeconds ?? 0.5;
  // Below the minimum nothing could ever be reported: every stretch would be cut too short.
  const everySeconds = Math.max(options.everySeconds ?? 15, minSeconds, 1);
  const jumpSeconds = options.jumpSeconds ?? 2;

  let playing = false;
  let start: number | null = null;
  let last: number | null = null;
  /** Wall-clock ms of `last`, when the caller gives one. */
  let lastAt: number | undefined;

  const close = (from: number | null, to: number | null): VideoSegment | null => {
    if (from === null || to === null || !Number.isFinite(from) || !Number.isFinite(to)) return null;
    if (to - from < minSeconds) return null;
    return { start: round(from), end: round(to) };
  };

  /** Whether `t` is ordinary playback from `last`, rather than a jump. */
  const continues = (t: number, rate: number, now?: number) => {
    if (last === null || t < last - BACKWARD_TOLERANCE) return false;
    const elapsed = now !== undefined && lastAt !== undefined ? Math.max(0, now - lastAt) / 1000 : 0;
    return t <= last + (jumpSeconds + elapsed) * Math.max(rate, 1);
  };
  const at = (now?: number) => {
    lastAt = now;
  };

  return {
    play(t) {
      const segment = playing ? close(start, last) : null;
      playing = true;
      start = t;
      last = t;
      at(undefined);
      return segment;
    },

    tick(t, rate = 1, now) {
      if (!playing || start === null) {
        last = t;
        at(now);
        return null;
      }
      if (!continues(t, rate, now)) {
        const segment = close(start, last);
        start = t;
        last = t;
        at(now);
        return segment;
      }
      last = Math.max(last ?? t, t);
      at(now);
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
      at(undefined);
      return segment;
    },

    pause(t, rate = 1, now) {
      if (!playing) {
        last = t;
        return null;
      }
      const end = continues(t, rate, now) ? Math.max(last ?? t, t) : last;
      const segment = close(start, end);
      playing = false;
      start = null;
      last = t;
      return segment;
    },

    flush(t, rate = 1, now) {
      if (!playing || start === null) return null;
      const end = continues(t, rate, now) ? Math.max(last ?? t, t) : last;
      const segment = close(start, end);
      if (segment) start = end;
      last = end;
      at(now);
      return segment;
    },
  };
}
