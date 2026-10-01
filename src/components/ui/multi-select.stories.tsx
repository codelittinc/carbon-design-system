import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { MultiSelect } from "./multi-select";
import { Tag } from "./tag";

const PEOPLE = [
  { value: "ana", label: "Ana Souza", sublabel: "ana@example.com" },
  { value: "bruno", label: "Bruno Lima", sublabel: "bruno@example.com" },
  { value: "carla", label: "Carla Dias", sublabel: "carla@example.com" },
  { value: "diego", label: "Diego Reis", sublabel: "diego@example.com", disabled: true },
];

/**
 * MultiSelect toggles several values from a searchable list. It renders no chips;
 * show the selection beside it, usually with Tag.
 */
const meta: Meta<typeof MultiSelect> = {
  title: "Components/Forms/MultiSelect",
  component: MultiSelect,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof MultiSelect>;

export const WithTags: Story = {
  render: () => {
    const [value, setValue] = useState(["ana"]);
    return (
      <div className="w-80 space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {value.map((v) => (
            <Tag key={v} variant="accent" onRemove={() => setValue(value.filter((x) => x !== v))}>
              {PEOPLE.find((p) => p.value === v)?.label}
            </Tag>
          ))}
        </div>
        <MultiSelect value={value} onChange={setValue} options={PEOPLE} placeholder="Search people…" />
      </div>
    );
  },
};
