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
import { createSegmentTracker, type VideoSegment } from "./video-segments";

export type { VideoSegment } from "./video-segments";

type VideoEvent = SyntheticEvent<HTMLVideoElement>;

export interface VideoViewerProps
  extends Omit<VideoHTMLAttributes<HTMLVideoElement>, "src" | "poster" | "title" | "onError" | "onEnded"> {
  src: string;
  poster?: string;
  /** The video's accessible name, such as the material's title. */
  title: string;
  /**
   * Seek here once the first source's metadata has loaded: where somebody
   * stopped last time. Ignored when it is within a second of the end.
   */
  startAt?: number;
  /**
   * A stretch actually played, with no seek inside it, and where the playhead
   * is now. Called on pause, before a seek, on end, when the page is hidden,
   * on unmount, and every `segmentEverySeconds` while playing. Stretches
   * under half a second are not reported.
   */
  onSegment?: (segment: VideoSegment, positionSeconds: number) => void;
  /** How often an open stretch is reported while playing. Default 15. */
  segmentEverySeconds?: number;
  /**
   * The video failed to load or to continue — for a presigned URL, usually
   * that it expired, which the bucket answers on the next range request.
   * Fetch a fresh URL and pass it as `src`: the viewer keeps the position, and
   * whether it was playing, across a `src` change.
   */
  onError?: (error: MediaError | null, positionSeconds: number) => void;
  onEnded?: () => void;
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
      onEnded,
      className,
      children,
      onPlaying,
      onTimeUpdate,
      onSeeking,
      onSeeked,
      onPause,
      onLoadedMetadata,
      ...props
    },
    ref,
  ) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    useImperativeHandle(ref, () => videoRef.current as HTMLVideoElement);

    const tracker = useRef(createSegmentTracker({ everySeconds: segmentEverySeconds }));
    // Latest callbacks, so the document listeners never hold stale ones.
    const callbacks = useRef({ onSegment, onError, onEnded });
    callbacks.current = { onSegment, onError, onEnded };

    /** Where the playhead last was, and whether it was playing: kept across a `src` change. */
    const position = useRef(0);
    const wasPlaying = useRef(false);
    const resume = useRef<{ time: number; playing: boolean } | null>(null);
    const startApplied = useRef(false);
    const previousSrc = useRef(src);

    const emit = (segment: VideoSegment | null) => {
      if (segment) callbacks.current.onSegment?.(segment, position.current);
    };

    // A new source (a refreshed URL): close what was being watched and come
    // back to the same place once the new source's metadata is in.
    useLayoutEffect(() => {
      if (previousSrc.current === src) return;
      previousSrc.current = src;
      emit(tracker.current.pause(position.current));
      resume.current = { time: position.current, playing: wasPlaying.current };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [src]);

    // The page going away or out of sight reports what was watched so far.
    useEffect(() => {
      const flush = () => emit(tracker.current.flush(videoRef.current?.currentTime ?? position.current));
      const onVisibility = () => {
        if (document.visibilityState === "hidden") flush();
      };
      document.addEventListener("visibilitychange", onVisibility);
      window.addEventListener("pagehide", flush);
      return () => {
        document.removeEventListener("visibilitychange", onVisibility);
        window.removeEventListener("pagehide", flush);
        emit(tracker.current.pause(position.current));
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleLoadedMetadata = (event: VideoEvent) => {
      const video = event.currentTarget;
      const pending = resume.current;
      if (pending) {
        resume.current = null;
        video.currentTime = pending.time;
        position.current = pending.time;
        if (pending.playing) video.play()?.catch(() => {});
        return;
      }
      if (!startApplied.current) {
        startApplied.current = true;
        const duration = video.duration;
        if (startAt && startAt > 0 && (!Number.isFinite(duration) || startAt < duration - 1)) {
          video.currentTime = startAt;
          position.current = startAt;
        }
      }
    };

    const handlePlaying = (event: VideoEvent) => {
      wasPlaying.current = true;
      position.current = event.currentTarget.currentTime;
      emit(tracker.current.play(position.current));
    };

    const handleTimeUpdate = (event: VideoEvent) => {
      const video = event.currentTarget;
      if (video.seeking) return;
      position.current = video.currentTime;
      emit(tracker.current.tick(video.currentTime, video.playbackRate));
    };

    const handleSeeking = (event: VideoEvent) => {
      emit(tracker.current.seek(event.currentTarget.currentTime));
      position.current = event.currentTarget.currentTime;
    };

    const handleSeeked = (event: VideoEvent) => {
      position.current = event.currentTarget.currentTime;
    };

    const handlePause = (event: VideoEvent) => {
      // A pause the browser makes on the way to `ended` is reported there.
      if (event.currentTarget.ended) return;
      wasPlaying.current = false;
      position.current = event.currentTarget.currentTime;
      emit(tracker.current.pause(position.current));
    };

    const handleEnded = (event: VideoEvent) => {
      wasPlaying.current = false;
      const video = event.currentTarget;
      position.current = Number.isFinite(video.duration) ? video.duration : video.currentTime;
      emit(tracker.current.pause(position.current));
      callbacks.current.onEnded?.();
    };

    const handleError = () => {
      callbacks.current.onError?.(videoRef.current?.error ?? null, position.current);
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
          onEnded={handleEnded}
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
