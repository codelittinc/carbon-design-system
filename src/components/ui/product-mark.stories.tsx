import type { Meta, StoryObj } from "@storybook/react";
import { ProductMark } from "./product-mark";

const meta: Meta<typeof ProductMark> = {
  title: "UI/ProductMark",
  component: ProductMark,
  args: { name: "Reimbursements" },
};
export default meta;

type Story = StoryObj<typeof ProductMark>;

export const Default: Story = {};
export const CustomInitial: Story = { args: { name: "Delinquency Center", initial: "D" } };
export const Compact: Story = { args: { compact: true } };
