import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Tag } from "./tag";

/** Tag is a removable Badge, for chosen values and applied filters. */
const meta: Meta<typeof Tag> = {
  title: "Components/Data Display/Tag",
  component: Tag,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Tag>;

export const Removable: Story = {
  render: () => {
    const [names, setNames] = useState(["Ana", "Bruno", "Carla"]);
    return (
      <div className="flex gap-1.5">
        {names.map((name) => (
          <Tag
            key={name}
            variant="accent"
            removeLabel={`Remove ${name}`}
            onRemove={() => setNames(names.filter((n) => n !== name))}
          >
            {name}
          </Tag>
        ))}
      </div>
    );
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex gap-1.5">
      {(["default", "accent", "success", "warning", "error", "info"] as const).map((v) => (
        <Tag key={v} variant={v}>
          {v}
        </Tag>
      ))}
    </div>
  ),
};
