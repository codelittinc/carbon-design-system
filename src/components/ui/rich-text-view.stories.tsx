import type { Meta, StoryObj } from "@storybook/react";
import { RichTextView } from "./rich-text-view";

const LOGO = "https://gatekeeper.carbonresidential.com/brand/codelitt-signature-logo.png";

/**
 * RichTextView renders stored rich text read-only: sanitized, styled like the
 * editor, with image alignment kept. Pair it with `RichTextEditor`.
 */
const meta: Meta<typeof RichTextView> = {
  title: "Components/Forms/RichTextView",
  component: RichTextView,
  tags: ["autodocs"],
  args: {
    className: "text-base leading-relaxed text-text-secondary",
    html: [
      "<h2>Set up your signature</h2>",
      "<p>Paste the block below into <strong>Gmail</strong>, then <a href=\"https://www.codelitt.com\">check the result</a>.</p>",
      "<ul><li>Keep the logo</li><li>Replace the placeholders</li></ul>",
      `<img src="${LOGO}" alt="Codelitt logo" width="64" data-align="left-wrap">`,
      "<p><strong>[Your full name]</strong><br>[Your job title]<br>+1 917 725 4119</p>",
    ].join(""),
  },
};
export default meta;

type Story = StoryObj<typeof RichTextView>;

export const Default: Story = {
  render: (args) => (
    <div className="max-w-2xl">
      <RichTextView {...args} />
    </div>
  ),
};

export const ImageAlignment: Story = {
  args: {
    html: ["left", "center", "right"]
      .map((align) => `<p>${align}</p><img src="${LOGO}" alt="" width="48" data-align="${align}">`)
      .join(""),
  },
  render: Default.render,
};
