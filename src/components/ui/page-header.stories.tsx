import type { Meta, StoryObj } from "@storybook/react";
import { Download, Plus } from "lucide-react";
import { PageHeader } from "./page-header";
import { Button } from "./button";

/**
 * PageHeader renders a page title (in the display font) with an optional
 * description and a right-aligned actions slot. Used at the top of dashboard
 * sections like Tenants, Leases, and Reports.
 */
const meta: Meta<typeof PageHeader> = {
  title: "Components/PageHeader",
  component: PageHeader,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof PageHeader>;

export const Default: Story = {
  args: {
    title: "Tenants",
    description: "All current, past, and applicant residents across your portfolio.",
  },
};

export const WithActions: Story = {
  render: () => (
    <PageHeader
      title="Leases"
      description="Active and pending lease agreements by property."
      actions={
        <>
          <Button variant="outline">
            <Download size={14} />
            Export
          </Button>
          <Button>
            <Plus size={14} />
            New Lease
          </Button>
        </>
      }
    />
  ),
};
