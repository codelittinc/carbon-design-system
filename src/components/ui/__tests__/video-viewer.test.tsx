import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { VideoViewer } from "../video-viewer";

/** jsdom has no media playback: give the element a playhead the test moves. */
function fakeMedia(video: HTMLVideoElement, duration = 120) {
  const state = { currentTime: 0, paused: true, seeking: false, ended: false };
  Object.defineProperties(video, {
    currentTime: { get: () => state.currentTime, set: (t: number) => (state.currentTime = t), configurable: true },
    duration: { get: () => duration, configurable: true },
    paused: { get: () => state.paused, configurable: true },
    seeking: { get: () => state.seeking, configurable: true },
    ended: { get: () => state.ended, configurable: true },
    playbackRate: { get: () => 1, configurable: true },
  });
  const play = vi.fn(() => {
    state.paused = false;
    return Promise.resolve();
  });
  video.play = play;
  return {
    state,
    play,
    /** Plays from the current time to `to` in quarter-second timeupdates. */
    playTo(to: number) {
      if (state.paused) {
        state.paused = false;
        fireEvent.playing(video);
      }
      while (state.currentTime + 0.25 <= to + 1e-9) {
        state.currentTime = Math.round((state.currentTime + 0.25) * 100) / 100;
        fireEvent.timeUpdate(video);
      }
    },
    pause() {
      state.paused = true;
      fireEvent.pause(video);
    },
    seek(to: number) {
      state.seeking = true;
      state.currentTime = to;
      fireEvent.seeking(video);
      state.seeking = false;
      fireEvent.seeked(video);
    },
  };
}

function video(): HTMLVideoElement {
  return screen.getByLabelText("Leasing basics") as HTMLVideoElement;
}

describe("VideoViewer", () => {
  it("is a labelled video with native controls, no CORS mode, and the poster", () => {
    render(<VideoViewer src="https://bucket.test/a.mp4" poster="https://bucket.test/p.jpg" title="Leasing basics" />);
    const el = video();
    expect(el.tagName).toBe("VIDEO");
    expect(el).toHaveAttribute("controls");
    expect(el).toHaveAttribute("src", "https://bucket.test/a.mp4");
    expect(el).toHaveAttribute("poster", "https://bucket.test/p.jpg");
    expect(el).toHaveAttribute("preload", "metadata");
    expect(el).not.toHaveAttribute("crossorigin");
  });

  it("reports watched stretches, and not what a seek skipped", () => {
    const onSegment = vi.fn();
    render(<VideoViewer src="a.mp4" title="Leasing basics" onSegment={onSegment} segmentEverySeconds={10} />);
    const media = fakeMedia(video());

    media.playTo(12);
    expect(onSegment).toHaveBeenLastCalledWith({ start: 0, end: 10 }, 10);
    media.seek(60);
    // The playhead is already at the new place when the stretch before it is reported.
    expect(onSegment).toHaveBeenLastCalledWith({ start: 10, end: 12 }, 60);
    media.playTo(63);
    media.pause();
    expect(onSegment).toHaveBeenLastCalledWith({ start: 60, end: 63 }, 63);
    expect(onSegment).toHaveBeenCalledTimes(3);
  });

  it("reports the open stretch when the page is hidden", () => {
    const onSegment = vi.fn();
    render(<VideoViewer src="a.mp4" title="Leasing basics" onSegment={onSegment} />);
    const media = fakeMedia(video());
    media.playTo(5);
    act(() => {
      window.dispatchEvent(new Event("pagehide"));
    });
    expect(onSegment).toHaveBeenLastCalledWith({ start: 0, end: 5 }, 5);
  });

  it("reports the open stretch on unmount", () => {
    const onSegment = vi.fn();
    const { unmount } = render(<VideoViewer src="a.mp4" title="Leasing basics" onSegment={onSegment} />);
    const media = fakeMedia(video());
    media.playTo(4);
    unmount();
    expect(onSegment).toHaveBeenLastCalledWith({ start: 0, end: 4 }, 4);
  });

  it("starts at `startAt` once, on the first source only", () => {
    const { rerender } = render(<VideoViewer src="v.mp4?sig=1" title="Leasing basics" startAt={42} />);
    const media = fakeMedia(video());
    fireEvent.loadedMetadata(video());
    expect(media.state.currentTime).toBe(42);

    media.state.currentTime = 50;
    fireEvent.timeUpdate(video());
    rerender(<VideoViewer src="v.mp4?sig=2" title="Leasing basics" startAt={42} />);
    fireEvent.loadedMetadata(video());
    expect(media.state.currentTime).toBe(50);
  });

  it("ignores `startAt` at the very end", () => {
    render(<VideoViewer src="a.mp4" title="Leasing basics" startAt={119.5} />);
    const media = fakeMedia(video(), 120);
    fireEvent.loadedMetadata(video());
    expect(media.state.currentTime).toBe(0);
  });

  it("keeps the position and playing state when `src` changes (a refreshed URL)", () => {
    const onError = vi.fn();
    const { rerender } = render(<VideoViewer src="a.mp4" title="Leasing basics" onError={onError} />);
    const media = fakeMedia(video());
    fireEvent.loadedMetadata(video());
    media.playTo(30);

    fireEvent.error(video());
    expect(onError).toHaveBeenCalledWith(null, 30);

    media.state.currentTime = 0; // a new source starts from the top
    rerender(<VideoViewer src="a.mp4?fresh" title="Leasing basics" onError={onError} />);
    fireEvent.loadedMetadata(video());
    expect(media.state.currentTime).toBe(30);
    expect(media.play).toHaveBeenCalled();
  });

  it("does not resume playing after a `src` change when it was paused", () => {
    const { rerender } = render(<VideoViewer src="v.mp4?sig=1" title="Leasing basics" />);
    const media = fakeMedia(video());
    fireEvent.loadedMetadata(video());
    media.playTo(8);
    media.pause();
    media.state.currentTime = 0; // a new source starts from the top
    rerender(<VideoViewer src="v.mp4?sig=2" title="Leasing basics" />);
    fireEvent.loadedMetadata(video());
    expect(media.state.currentTime).toBe(8);
    expect(media.play).not.toHaveBeenCalled();
  });

  it("reports the end once and calls onEnded", () => {
    const onSegment = vi.fn();
    const onEnded = vi.fn();
    render(<VideoViewer src="a.mp4" title="Leasing basics" onSegment={onSegment} onEnded={onEnded} />);
    const media = fakeMedia(video(), 6);
    media.playTo(6);
    media.state.ended = true;
    media.state.paused = true;
    fireEvent.pause(video());
    fireEvent.ended(video());
    expect(onSegment).toHaveBeenCalledTimes(1);
    expect(onSegment).toHaveBeenLastCalledWith({ start: 0, end: 6 }, 6);
    expect(onEnded).toHaveBeenCalledTimes(1);
    expect(onEnded.mock.calls[0][0]).toHaveProperty("currentTarget");
  });

  it("does not lose the position to the new source's playhead at 0, even when it fails too", () => {
    const onError = vi.fn();
    const { rerender } = render(<VideoViewer src="v.mp4?sig=1" title="Leasing basics" onError={onError} />);
    const media = fakeMedia(video());
    fireEvent.loadedMetadata(video());
    media.playTo(30);

    rerender(<VideoViewer src="v.mp4?sig=2" title="Leasing basics" onError={onError} />);
    media.state.currentTime = 0;
    fireEvent.timeUpdate(video());
    fireEvent.error(video());
    expect(onError).toHaveBeenLastCalledWith(null, 30);

    rerender(<VideoViewer src="v.mp4?sig=3" title="Leasing basics" onError={onError} />);
    fireEvent.loadedMetadata(video());
    expect(media.state.currentTime).toBe(30);
  });

  it("treats a src with another path as another video: nothing carries over", () => {
    const onSegment = vi.fn();
    const { rerender } = render(
      <VideoViewer src="https://bucket.test/a.mp4?sig=1" title="Leasing basics" onSegment={onSegment} startAt={10} />,
    );
    const media = fakeMedia(video(), 600);
    fireEvent.loadedMetadata(video());
    media.playTo(300);

    rerender(<VideoViewer src="https://bucket.test/b.mp4?sig=1" title="Leasing basics" onSegment={onSegment} startAt={40} />);
    // Started at 10, so the 15 s stretches end at 295; the swap closes the last one.
    expect(onSegment).toHaveBeenLastCalledWith({ start: 295, end: 300 }, 300);
    media.state.currentTime = 0;
    media.state.paused = true;
    fireEvent.loadedMetadata(video());
    expect(media.state.currentTime).toBe(40);
    expect(media.play).not.toHaveBeenCalled();
  });

  it("a seek before playback wins over a `startAt` that arrives later", () => {
    const { rerender } = render(<VideoViewer src="a.mp4" title="Leasing basics" />);
    const media = fakeMedia(video(), 600);
    fireEvent.loadedMetadata(video());
    media.seek(120);
    rerender(<VideoViewer src="a.mp4" title="Leasing basics" startAt={45} />);
    expect(media.state.currentTime).toBe(120);
  });

  it("still applies `startAt` when the first source failed before it loaded", () => {
    const { rerender } = render(<VideoViewer src="expired.mp4" title="Leasing basics" startAt={300} />);
    const media = fakeMedia(video(), 600);
    fireEvent.error(video());
    rerender(<VideoViewer src="fresh.mp4" title="Leasing basics" startAt={300} />);
    fireEvent.loadedMetadata(video());
    expect(media.state.currentTime).toBe(300);
  });

  it("applies a `startAt` that arrives after the metadata, but not once playback started", () => {
    const { rerender } = render(<VideoViewer src="a.mp4" title="Leasing basics" />);
    const media = fakeMedia(video(), 600);
    fireEvent.loadedMetadata(video());
    rerender(<VideoViewer src="a.mp4" title="Leasing basics" startAt={240} />);
    expect(media.state.currentTime).toBe(240);

    const second = render(<VideoViewer src="z.mp4" title="Other" />);
    const other = second.getByLabelText("Other") as HTMLVideoElement;
    const otherMedia = fakeMedia(other, 600);
    fireEvent.loadedMetadata(other);
    fireEvent.playing(other);
    second.rerender(<VideoViewer src="z.mp4" title="Other" startAt={240} />);
    expect(otherMedia.state.currentTime).toBe(0);
  });

  it("reports at a new `segmentEverySeconds` from the moment it changes", () => {
    const onSegment = vi.fn();
    const { rerender } = render(
      <VideoViewer src="a.mp4" title="Leasing basics" onSegment={onSegment} segmentEverySeconds={10} />,
    );
    const media = fakeMedia(video());
    media.playTo(4);
    expect(onSegment).not.toHaveBeenCalled();
    rerender(<VideoViewer src="a.mp4" title="Leasing basics" onSegment={onSegment} segmentEverySeconds={2} />);
    expect(onSegment).toHaveBeenLastCalledWith({ start: 0, end: 4 }, 4);
    media.playTo(6);
    expect(onSegment).toHaveBeenLastCalledWith({ start: 4, end: 6 }, 6);
  });

  it("still calls the consumer's own media handlers", () => {
    const onTimeUpdate = vi.fn();
    const onPause = vi.fn();
    render(<VideoViewer src="a.mp4" title="Leasing basics" onTimeUpdate={onTimeUpdate} onPause={onPause} />);
    const media = fakeMedia(video());
    media.playTo(1);
    media.pause();
    expect(onTimeUpdate).toHaveBeenCalled();
    expect(onPause).toHaveBeenCalledTimes(1);
  });

  it("passes <track> children through and forwards the ref", () => {
    const ref = { current: null as HTMLVideoElement | null };
    render(
      <VideoViewer ref={ref} src="a.mp4" title="Leasing basics">
        <track kind="captions" src="a.vtt" srcLang="en" label="English" />
      </VideoViewer>,
    );
    expect(ref.current).toBe(video());
    expect(video().querySelector("track")).toHaveAttribute("kind", "captions");
  });
});
