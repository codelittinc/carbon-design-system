import type { Meta, StoryObj } from "@storybook/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";

/**
 * Tabs is a Radix-based tab set. `Tabs` takes a `defaultValue`; each
 * `TabsTrigger`/`TabsContent` pair is matched by `value`. Used here to organize
 * a tenant detail view into Overview, Ledger, and Documents.
 */
const meta: Meta<typeof Tabs> = {
  title: "Components/Tabs",
  component: Tabs,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-[480px]">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="ledger">Ledger</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="text-sm text-text-secondary">
        <p>
          Ava Thompson — Unit 204B. Lease active through Dec 2026. Current
          balance: <span className="text-text-primary">$0.00</span>.
        </p>
      </TabsContent>
      <TabsContent value="ledger" className="text-sm text-text-secondary">
        <p>
          Last payment of <span className="text-text-primary">$1,450.00</span>{" "}
          applied to RENT on Jun 1, 2026. No open charges.
        </p>
      </TabsContent>
      <TabsContent value="documents" className="text-sm text-text-secondary">
        <p>Signed lease, move-in inspection report, and renters insurance COI.</p>
      </TabsContent>
    </Tabs>
  ),
};

export const ManyTabs: Story = {
  render: () => (
    <Tabs defaultValue="summary" className="w-[640px]">
      <TabsList>
        <TabsTrigger value="summary">Summary</TabsTrigger>
        <TabsTrigger value="charges">Charges</TabsTrigger>
        <TabsTrigger value="payments">Payments</TabsTrigger>
        <TabsTrigger value="deposits">Deposits</TabsTrigger>
        <TabsTrigger value="screenings">Screenings</TabsTrigger>
        <TabsTrigger value="evictions">Evictions</TabsTrigger>
      </TabsList>
      <TabsContent value="summary" className="text-sm text-text-secondary">
        Tenant summary and lease term details.
      </TabsContent>
      <TabsContent value="charges" className="text-sm text-text-secondary">
        Recurring and one-time charges posted to the ledger.
      </TabsContent>
      <TabsContent value="payments" className="text-sm text-text-secondary">
        Payment history with FIFO application breakdown.
      </TabsContent>
      <TabsContent value="deposits" className="text-sm text-text-secondary">
        Security deposit of $1,450.00 held; no dispositions.
      </TabsContent>
      <TabsContent value="screenings" className="text-sm text-text-secondary">
        Background and credit screening: APPROVED.
      </TabsContent>
      <TabsContent value="evictions" className="text-sm text-text-secondary">
        No eviction cases on record.
      </TabsContent>
    </Tabs>
  ),
};
