import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { SegmentedControl } from "./segmented-control";

/** SegmentedControl picks one of a few options, all visible. */
const meta: Meta<typeof SegmentedControl> = {
  title: "Components/Forms/SegmentedControl",
  component: SegmentedControl,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof SegmentedControl>;

const OPTIONS = [
  { value: "now", label: "Send now" },
  { value: "later", label: "Send later" },
];

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>("now");
    return <SegmentedControl aria-label="When" options={OPTIONS} value={value} onChange={setValue} />;
  },
};

export const Unset: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>(null);
    return (
      <SegmentedControl
        aria-label="Verdict"
        size="sm"
        error={value === null}
        options={[
          { value: "yes", label: "Yes" },
          { value: "maybe", label: "Maybe" },
          { value: "no", label: "No" },
        ]}
        value={value}
        onChange={setValue}
      />
    );
  },
};
