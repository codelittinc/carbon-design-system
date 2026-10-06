import type { Meta, StoryObj } from "@storybook/react";
import * as Icons from "./icons";
import { Button } from "./button";

/**
 * The icon set, re-exported from lucide-react with an `Icon` suffix. Import
 * them from the package (`import { SearchIcon } from "@codelittinc/carbon-design-system"`)
 * rather than depending on lucide-react or drawing SVGs. An icon-only button
 * needs an `aria-label`.
 */
const meta: Meta = {
  title: "Foundations/Icons",
  tags: ["autodocs"],
};
export default meta;

const ICONS = Object.entries(Icons).filter(([, value]) => typeof value === "object" || typeof value === "function") as [
  string,
  Icons.IconComponent,
][];

export const All: StoryObj = {
  render: () => (
    <div className="grid grid-cols-4 gap-4 text-xs text-text-secondary sm:grid-cols-6">
      {ICONS.map(([name, Icon]) => (
        <div key={name} className="flex flex-col items-center gap-2 rounded-md border border-border p-3">
          <Icon size={18} />
          <code>{name}</code>
        </div>
      ))}
    </div>
  ),
};

export const InAButton: StoryObj = {
  render: () => (
    <div className="flex gap-2">
      <Button>
        <Icons.PlusIcon size={14} />
        Add
      </Button>
      <Button variant="ghost" size="icon" aria-label="Delete">
        <Icons.TrashIcon size={14} />
      </Button>
    </div>
  ),
};
