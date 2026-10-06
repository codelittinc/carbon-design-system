import type { Meta, StoryObj } from "@storybook/react";
import { TextLink } from "./text-link";

/**
 * TextLink is a link inside running text or a table cell, with no button box.
 * `asChild` styles a router's link; `external` opens a new tab and says so.
 */
const meta: Meta<typeof TextLink> = {
  title: "Components/Navigation/TextLink",
  component: TextLink,
  tags: ["autodocs"],
  args: { href: "#", children: "View contract" },
};
export default meta;

type Story = StoryObj<typeof TextLink>;

export const Default: Story = {};

export const InText: Story = {
  render: () => (
    <p className="max-w-md text-sm text-text-secondary">
      The invoice was sent to the customer. <TextLink href="#">Open the invoice</TextLink> to see what was
      billed.
    </p>
  ),
};

export const External: Story = { args: { href: "https://example.com", external: true, children: "Google Places docs" } };

/** `asChild` hands the element to your router's link, keeping the style. */
export const AsChild: Story = {
  render: () => (
    <TextLink asChild>
      <a href="#" data-router-link="">
        Router link
      </a>
    </TextLink>
  ),
};
