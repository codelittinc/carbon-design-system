import type { Preview } from "@storybook/react";
import "../src/styles/theme.css";

/*
 * CarbonOS is dark-mode-first. The canvas defaults to the carbon-950 background
 * so components render in their intended context.
 */
const preview: Preview = {
  parameters: {
    backgrounds: {
      default: "carbon",
      values: [
        { name: "carbon", value: "#09090b" },
        { name: "surface", value: "#131316" },
        { name: "light", value: "#fafafa" },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: [
          "Introduction",
          "Foundations",
          ["Colors", "Typography", "Spacing", "Radius"],
          "Components",
        ],
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="font-body text-text-primary antialiased">
        <Story />
      </div>
    ),
  ],
};

export default preview;
