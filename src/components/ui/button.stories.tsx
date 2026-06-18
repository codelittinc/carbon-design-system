import type { Meta, StoryObj } from "@storybook/react";
import { Plus, Search, Trash2 } from "lucide-react";
import { Button } from "./button";

/**
 * Button is the primary action trigger across the product — posting charges,
 * approving applications, saving leases. It supports five visual variants and
 * four sizes (including an icon-only size) via class-variance-authority.
 */
const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
};
export default meta;

const variants = ["default", "destructive", "outline", "ghost", "link"] as const;
const sizes = ["sm", "default", "lg", "icon"] as const;

export const Default: StoryObj<typeof Button> = {
  args: {
    children: "Post Charge",
  },
};

export const AllVariants: StoryObj<typeof Button> = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      {variants.map((variant) => (
        <Button key={variant} variant={variant}>
          {variant}
        </Button>
      ))}
    </div>
  ),
};

export const Sizes: StoryObj<typeof Button> = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      {sizes.map((size) => (
        <Button key={size} size={size} aria-label={size}>
          {size === "icon" ? <Plus size={16} /> : size}
        </Button>
      ))}
    </div>
  ),
};

export const WithIcon: StoryObj<typeof Button> = {
  render: () => (
    <Button>
      <Plus size={16} />
      New Lease
    </Button>
  ),
};

export const IconOnly: StoryObj<typeof Button> = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button size="icon" variant="outline" aria-label="Search tenants">
        <Search size={16} />
      </Button>
      <Button size="icon" variant="destructive" aria-label="Delete charge">
        <Trash2 size={16} />
      </Button>
    </div>
  ),
};

export const Disabled: StoryObj<typeof Button> = {
  args: {
    children: "Approve Application",
    disabled: true,
  },
};

/**
 * There is no built-in loading prop — convey a pending state by disabling the
 * button and swapping the label, the convention used in the product's forms.
 */
export const Loading: StoryObj<typeof Button> = {
  render: () => (
    <Button disabled>
      <Search size={16} className="animate-pulse" />
      Posting…
    </Button>
  ),
};
