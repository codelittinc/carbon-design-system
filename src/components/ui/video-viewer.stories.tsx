import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button } from "./button";
import { VideoViewer, type VideoSegment } from "./video-viewer";

/**
 * VideoViewer plays a video file and reports which parts were actually
 * watched. The sample is a 20-second synthetic clip with a running counter, so
 * the reported segments are easy to check against what is on screen.
 */
const meta: Meta<typeof VideoViewer> = {
  title: "Components/Media/VideoViewer",
  component: VideoViewer,
  tags: ["autodocs"],
  args: { src: "video-viewer/sample.mp4", title: "Carbon sample video" },
};
export default meta;

type Story = StoryObj<typeof VideoViewer>;

export const Default: Story = {
  render: (args) => (
    <div className="max-w-2xl">
      <VideoViewer {...args} />
    </div>
  ),
};

export const WithPoster: Story = {
  args: { poster: "file-viewer/photo.png" },
  render: Default.render,
};

/** Resumes where somebody stopped: 12 seconds in. */
export const StartAt: Story = {
  args: { startAt: 12 },
  render: Default.render,
};

/** Play, pause and skip around: each reported segment is listed below the video. */
export const ReportsWatchedSegments: Story = {
  render: (args) => {
    const [segments, setSegments] = useState<VideoSegment[]>([]);
    const watched = segments.reduce((sum, s) => sum + (s.end - s.start), 0);
    return (
      <div className="max-w-2xl space-y-3">
        <VideoViewer
          {...args}
          segmentEverySeconds={5}
          onSegment={(segment) => setSegments((all) => [...all, segment])}
        />
        <p className="text-sm text-text-muted">
          {segments.length} segments, {watched.toFixed(1)} s reported (segments may overlap when rewatched)
        </p>
        <ul className="space-y-1 text-sm text-text-primary">
          {segments.map((s, i) => (
            <li key={i} className="tabular-nums">
              {s.start.toFixed(1)} s → {s.end.toFixed(1)} s
            </li>
          ))}
        </ul>
      </div>
    );
  },
};

/**
 * A presigned URL expires; the consumer swaps in a fresh one for the SAME
 * video (here, the same file with a new signature). Play for a few seconds,
 * then swap: the viewer comes back to the same place, still playing.
 */
export const KeepsItsPlaceOnAFreshUrl: Story = {
  render: (args) => {
    const [signature, setSignature] = useState(1);
    const [lastError, setLastError] = useState<string | null>(null);
    return (
      <div className="max-w-2xl space-y-3">
        <VideoViewer
          {...args}
          src={`video-viewer/sample.mp4?X-Amz-Signature=${signature}`}
          onError={(_e, position) => setLastError(`Failed at ${position.toFixed(1)} s`)}
        />
        <div className="flex items-center gap-3 text-sm text-text-muted">
          <Button size="sm" variant="outline" onClick={() => setSignature((n) => n + 1)}>
            Swap to a fresh URL
          </Button>
          <span>Signature #{signature}</span>
          {lastError ? <span>{lastError}</span> : null}
        </div>
      </div>
    );
  },
};
