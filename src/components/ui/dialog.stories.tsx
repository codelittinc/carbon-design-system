import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./dialog";
import { Button } from "./button";
import { Input } from "./input";

/**
 * Modal dialog built on Radix. Compose `DialogTrigger` with a `Button asChild`,
 * then `DialogContent` containing a header, body, and footer. Used across the
 * product for confirmations and short forms (e.g. recording a payment).
 */
const meta: Meta = {
  title: "Components/Overlays/Dialog",
  tags: ["autodocs"],
};
export default meta;

export const Default: StoryObj = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>View lease summary</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Lease #L-2049 · Unit 4B</DialogTitle>
          <DialogDescription>
            12-month lease for Jordan Avery, $1,850/mo. Starts Jul 1, 2026.
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm text-text-secondary">
          The tenant is a current resident in good standing with no open balance.
        </p>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const WithForm: StoryObj = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Record payment</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record payment</DialogTitle>
          <DialogDescription>
            Payments apply FIFO to the tenant&apos;s open charges.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-text-muted">Amount</label>
            <Input type="number" placeholder="1850.00" defaultValue="1850.00" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-text-muted">Reference / check #</label>
            <Input placeholder="e.g. 100482" />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button>Post payment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const Controlled: StoryObj = {
  render: () => {
    function Demo() {
      const [open, setOpen] = useState(false);
      return (
        <div className="flex flex-col items-start gap-3">
          <Button variant="outline" onClick={() => setOpen(true)}>
            Open via external state
          </Button>
          <p className="text-xs text-text-muted">open = {String(open)}</p>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Activate lease</DialogTitle>
                <DialogDescription>
                  Activation moves Unit 4B to OCCUPIED and the tenant to CURRENT_RESIDENT.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setOpen(false)}>Activate</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      );
    }
    return <Demo />;
  },
};
