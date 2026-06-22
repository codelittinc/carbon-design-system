import type { Meta, StoryObj } from "@storybook/react";
import { DefinitionList, DefinitionItem } from "./definition-list";
import { Badge } from "./badge";

/**
 * DefinitionList lays out label/value pairs in a grid for detail panels. Each
 * pair is a DefinitionItem; values can be plain text or rich nodes like a Badge.
 */
const meta: Meta<typeof DefinitionList> = {
  title: "Components/Data Display/DefinitionList",
  component: DefinitionList,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof DefinitionList>;

export const TwoColumns: Story = {
  render: () => (
    <DefinitionList>
      <DefinitionItem label="Type">Property Manager</DefinitionItem>
      <DefinitionItem label="1099 Eligible">Yes</DefinitionItem>
      <DefinitionItem label="Email">ap@acme.com</DefinitionItem>
      <DefinitionItem label="Payment Terms">Net 30</DefinitionItem>
      <DefinitionItem label="Status">
        <Badge variant="success">Active</Badge>
      </DefinitionItem>
    </DefinitionList>
  ),
};

export const SingleColumn: Story = {
  render: () => (
    <DefinitionList columns={1}>
      <DefinitionItem label="Property">Maple Court Apartments</DefinitionItem>
      <DefinitionItem label="Address">123 Maple St, Austin, TX</DefinitionItem>
    </DefinitionList>
  ),
};
