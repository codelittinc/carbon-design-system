"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  type SyntheticEvent,
  type VideoHTMLAttributes,
} from "react";
import { cn } from "@/lib/cn";
import { createSegmentTracker, type SegmentTracker, type VideoSegment } from "./video-segments";

export type { VideoSegment } from "./video-segments";

type VideoEvent = SyntheticEvent<HTMLVideoElement>;

// The source-swap bookkeeping must run before the new source's first events;
// on the server there is no layout phase (and React 18 warns about one).
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** Query parameters that sign a URL rather than name a video (S3 SigV4/V2, CloudFront). */
const SIGNING_PARAM = /^(x-amz-.*|signature|expires|awsaccesskeyid|key-pair-id|policy)$/i;

/** The video a URL names: the URL without the parameters a re-signed URL changes. */
function videoIdentity(src: string): string {
  try {
    const url = new URL(src, "http://relative.invalid");
    const kept = [...url.searchParams].filter(([key]) => !SIGNING_PARAM.test(key));
    kept.sort(([a], [b]) => a.localeCompare(b));
    return `${url.origin}${url.pathname}?${new URLSearchParams(kept).toString()}`;
  } catch {
    return src;
  }
}

const now = () => (typeof performance === "undefined" ? Date.now() : performance.now());

export interface VideoViewerProps
  extends Omit<VideoHTMLAttributes<HTMLVideoElement>, "src" | "poster" | "title" | "onError"> {
  src: string;
  poster?: string;
  /** The video's accessible name, such as the material's title. */
  title: string;
  /**
   * Where to start: where somebody stopped last time. Applied once, when the
   * video first has metadata — or later, if it arrives after that but before
   * playback starts. Ignored when it is within a second of the end.
   */
  startAt?: number;
  /**
   * A stretch actually played, with no seek inside it, and where the playhead
   * is now. Called on pause, on a seek (after the jump), on end, when the page
   * is hidden, on unmount, and every `segmentEverySeconds` while playing.
   * Stretches under half a second are not reported.
   */
  onSegment?: (segment: VideoSegment, positionSeconds: number) => void;
  /** How often an open stretch is reported while playing. Default 15. */
  segmentEverySeconds?: number;
  /**
   * The video failed to load or to continue — for a presigned URL, usually
   * that it expired, which the bucket answers on the next range request.
   * Fetch a fresh URL and pass it as `src`: the viewer keeps the position, and
   * whether it was playing, across a `src` change, however many it takes.
   *
   * A `src` that names another video is a different VIDEO, not a fresh URL
   * for this one: everything starts over, and its `startAt` applies. Which
   * video a URL names is `videoKey` when given, or else the URL without its
   * signing parameters (`X-Amz-*`, `Signature`, `Expires`, …).
   *
   * The fresh URL must be a different string: the same one changes nothing,
   * and the element stays in its error state. For a stable redirect endpoint,
   * add a cache-busting parameter (and pass `videoKey`).
   */
  onError?: (error: MediaError | null, positionSeconds: number) => void;
  /**
   * Which video this is — a material id, say. When it is unchanged, a new
   * `src` is a refreshed URL for the same video; when it changes, a new video.
   * Leave it out and the URL decides (see `onError`).
   */
  videoKey?: string;
}

/** Calls the consumer's handler as well as ours. */
function both(mine: (event: VideoEvent) => void, theirs?: (event: VideoEvent) => void) {
  return (event: VideoEvent) => {
    mine(event);
    theirs?.(event);
  };
}

/**
 * Plays a video file — an MP4 from a URL, typically a presigned one on a
 * bucket — with the browser's own controls, and reports which parts were
 * actually watched through `onSegment`. Seeking past a part is not watching
 * it, so the reported segments add up to real viewing.
 *
 * The browser's controls are deliberate: they are keyboard-operable,
 * screen-reader-labelled and familiar on every platform. `crossOrigin` is not
 * set, so a plain media URL plays without the bucket needing CORS. Pass
 * `<track>` elements as children for captions.
 */
const VideoViewer = forwardRef<HTMLVideoElement, VideoViewerProps>(
  (
    {
      src,
      poster,
      title,
      startAt,
      onSegment,
      segmentEverySeconds = 15,
      onError,
      videoKey,
      className,
      children,
      onPlaying,
      onTimeUpdate,
      onSeeking,
      onSeeked,
      onPause,
      onEnded,
      onLoadedMetadata,
      ...props
    },
    ref,
  ) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    useImperativeHandle(ref, () => videoRef.current as HTMLVideoElement, []);

    const trackerRef = useRef<SegmentTracker | null>(null);
    if (trackerRef.current === null) trackerRef.current = createSegmentTracker({ everySeconds: segmentEverySeconds });
    const tracker = trackerRef as { current: SegmentTracker };
    // The callbacks as of the last commit. Updated in a layout effect declared
    // AFTER the source-swap one, so a swap reports the old video's last stretch
    // to the old video's `onSegment`, never the new one's.
    const callbacks = useRef({ onSegment, onError });

    /** Where the playhead last really was. Not overwritten while a new source loads. */
    const position = useRef(0);
    const wasPlaying = useRef(false);
    /** A source swap in flight: where to come back to once the new source has metadata. */
    const resume = useRef<{ time: number; playing: boolean } | null>(null);
    /** Whether any source has had metadata: before that there is no position to keep. */
    const hadMetadata = useRef(false);
    /** `startAt` is used up once applied, or once playback starts without it. */
    const startDone = useRef(false);
    const identity = videoKey ?? videoIdentity(src);
    const previousSrc = useRef(src);
    const previousIdentity = useRef(identity);

    const rate = () => videoRef.current?.playbackRate ?? 1;
    /** The live playhead, unless a new source is loading (it reads 0 then). */
    const livePosition = (video: HTMLVideoElement | null) => {
      if (video && !resume.current && hadMetadata.current) position.current = video.currentTime;
      return position.current;
    };
    const emit = (segment: VideoSegment | null) => {
      if (segment) callbacks.current.onSegment?.(segment, position.current);
    };

    const applyStartAt = (video: HTMLVideoElement) => {
      if (startDone.current || startAt === undefined) return;
      startDone.current = true;
      const duration = video.duration;
      if (startAt > 0 && (!Number.isFinite(duration) || startAt < duration - 1)) {
        video.currentTime = startAt;
        position.current = startAt;
      }
    };

    // A new source (a refreshed URL): close what was being watched and come
    // back to the same place once the new source's metadata is in. A swap
    // during a swap keeps the first one's target; a swap before any metadata
    // has nothing to keep, and `startAt` still applies.
    useIsomorphicLayoutEffect(() => {
      if (previousSrc.current === src) return;
      previousSrc.current = src;
      const sameVideo = previousIdentity.current === identity;
      previousIdentity.current = identity;
      emit(tracker.current.pause(position.current, rate()));
      if (!sameVideo) {
        // Another video: nothing of this one carries over.
        resume.current = null;
        hadMetadata.current = false;
        startDone.current = false;
        wasPlaying.current = false;
        position.current = 0;
        return;
      }
      if (hadMetadata.current && !resume.current) {
        resume.current = { time: position.current, playing: wasPlaying.current };
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [src]);

    useIsomorphicLayoutEffect(() => {
      callbacks.current = { onSegment, onError };
    });

    // A `startAt` that arrives after the metadata, before anybody pressed play.
    useEffect(() => {
      const video = videoRef.current;
      if (video && hadMetadata.current && !resume.current) applyStartAt(video);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startAt]);

    // A new reporting interval: report the open stretch and carry on with a
    // tracker that uses it.
    const trackerEvery = useRef(segmentEverySeconds);
    useEffect(() => {
      if (trackerEvery.current === segmentEverySeconds) return;
      trackerEvery.current = segmentEverySeconds;
      const playing = wasPlaying.current;
      emit(tracker.current.pause(livePosition(videoRef.current), rate()));
      tracker.current = createSegmentTracker({ everySeconds: segmentEverySeconds });
      if (playing) tracker.current.play(position.current);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [segmentEverySeconds]);

    // The page going away or out of sight reports what was watched so far.
    useEffect(() => {
      // The element, held here: at unmount the ref is already null.
      const video = videoRef.current;
      const flush = () => emit(tracker.current.flush(livePosition(video), rate(), now()));
      const onVisibility = () => {
        if (document.visibilityState === "hidden") flush();
      };
      document.addEventListener("visibilitychange", onVisibility);
      window.addEventListener("pagehide", flush);
      return () => {
        document.removeEventListener("visibilitychange", onVisibility);
        window.removeEventListener("pagehide", flush);
        emit(tracker.current.pause(livePosition(video), video?.playbackRate ?? 1, now()));
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleLoadedMetadata = (event: VideoEvent) => {
      const video = event.currentTarget;
      hadMetadata.current = true;
      const pending = resume.current;
      if (pending) {
        resume.current = null;
        video.currentTime = pending.time;
        position.current = pending.time;
        if (pending.playing) {
          // Refused (an autoplay policy, another swap): it is paused, so say so.
          video.play()?.catch(() => {
            wasPlaying.current = false;
          });
        }
        return;
      }
      applyStartAt(video);
    };

    const handlePlaying = (event: VideoEvent) => {
      startDone.current = true;
      wasPlaying.current = true;
      position.current = event.currentTarget.currentTime;
      emit(tracker.current.play(position.current));
    };

    const handleTimeUpdate = (event: VideoEvent) => {
      const video = event.currentTarget;
      // While a new source loads its playhead reads 0; that is not where we are.
      if (video.seeking || resume.current) return;
      position.current = video.currentTime;
      emit(tracker.current.tick(video.currentTime, video.playbackRate, now()));
    };

    const handleSeeking = (event: VideoEvent) => {
      if (resume.current) return;
      // Somebody chose a place: a `startAt` arriving after this must not move them.
      startDone.current = true;
      position.current = event.currentTarget.currentTime;
      emit(tracker.current.seek(position.current));
    };

    const handleSeeked = (event: VideoEvent) => {
      if (!resume.current) position.current = event.currentTarget.currentTime;
    };

    const handlePause = (event: VideoEvent) => {
      const video = event.currentTarget;
      // A pause on the way to `ended` is reported there; one during a source swap is not the viewer's.
      if (video.ended || resume.current) return;
      wasPlaying.current = false;
      position.current = video.currentTime;
      emit(tracker.current.pause(position.current, video.playbackRate, now()));
    };

    const handleEnded = (event: VideoEvent) => {
      wasPlaying.current = false;
      const video = event.currentTarget;
      position.current = Number.isFinite(video.duration) ? video.duration : video.currentTime;
      emit(tracker.current.pause(position.current, video.playbackRate));
    };

    const handleError = () => {
      const at = resume.current?.time ?? position.current;
      callbacks.current.onError?.(videoRef.current?.error ?? null, at);
    };

    return (
      <div className={cn("w-full overflow-hidden rounded-lg border border-border bg-surface-overlay", className)}>
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          aria-label={title}
          controls
          playsInline
          preload="metadata"
          controlsList="nodownload"
          className="block aspect-video h-auto w-full bg-surface-overlay"
          {...props}
          onLoadedMetadata={both(handleLoadedMetadata, onLoadedMetadata)}
          onPlaying={both(handlePlaying, onPlaying)}
          onTimeUpdate={both(handleTimeUpdate, onTimeUpdate)}
          onSeeking={both(handleSeeking, onSeeking)}
          onSeeked={both(handleSeeked, onSeeked)}
          onPause={both(handlePause, onPause)}
          onEnded={both(handleEnded, onEnded)}
          onError={handleError}
        >
          {children}
        </video>
      </div>
    );
  },
);
VideoViewer.displayName = "VideoViewer";

export { VideoViewer };
export { createSegmentTracker, type SegmentTracker, type SegmentTrackerOptions } from "./video-segments";
