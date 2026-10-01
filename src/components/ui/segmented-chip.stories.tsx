import type { Meta, StoryObj } from "@storybook/react";
import { SegmentedChip } from "./segmented-chip";
import {
  NEUTRAL_CATEGORICAL_COLOR,
  getCategoricalColor,
  getCategoricalSegments,
} from "@/lib/categorical-colors";

/**
 * SegmentedChip is a small clickable chip whose fill is split into one band per
 * category, from the categorical palette. It reads the same in both themes.
 */
const meta: Meta<typeof SegmentedChip> = {
  title: "Components/Data Display/SegmentedChip",
  component: SegmentedChip,
  tags: ["autodocs"],
  args: {
    segments: [{ color: getCategoricalColor(0) }],
    label: "Jane D.",
  },
  decorators: [
    (Story) => (
      <div className="w-40">
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof SegmentedChip>;

export const SingleColor: Story = {};

export const ThreeSegments: Story = {
  args: { segments: getCategoricalSegments([0, 1, 2]), label: "John S." },
};

export const Neutral: Story = {
  args: { segments: [{ color: NEUTRAL_CATEGORICAL_COLOR }], label: "Alex M." },
};

export const WithOverflowSegment: Story = {
  args: { segments: getCategoricalSegments([0, 1, 2, 3, 4, 5]), label: "Sam K. · 4h" },
};

/** Every palette fill, to check white text holds on each. */
export const Palette: Story = {
  render: () => (
    <div className="flex flex-col gap-1">
      {Array.from({ length: 11 }, (_, id) => (
        <SegmentedChip key={id} segments={[{ color: getCategoricalColor(id) }]} label={`Project ${id + 1}`} />
      ))}
    </div>
  ),
};
