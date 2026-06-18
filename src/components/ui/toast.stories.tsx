import type { Meta, StoryObj } from "@storybook/react";
import { ToastProvider, useToast } from "./toast";
import { Button } from "./button";

/**
 * Transient notifications. Mount a `ToastProvider` once near the app root, then
 * call `useToast().toast({ title, description?, variant? })` from anywhere.
 * Variants: "default" | "success" | "error". Toasts auto-dismiss after ~4s.
 */
const meta: Meta = {
  title: "Components/Toast",
  tags: ["autodocs"],
};
export default meta;

function ToastDemo() {
  const { toast } = useToast();
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        onClick={() =>
          toast({
            title: "Charge posted",
            description: "Rent of $1,850.00 posted to Lease #L-2049.",
          })
        }
      >
        Default toast
      </Button>
      <Button
        onClick={() =>
          toast({
            variant: "success",
            title: "Payment recorded",
            description: "$1,850.00 applied to open charges (FIFO).",
          })
        }
      >
        Success toast
      </Button>
      <Button
        variant="destructive"
        onClick={() =>
          toast({
            variant: "error",
            title: "Posting failed",
            description: "Accounting period is CLOSED and rejects new entries.",
          })
        }
      >
        Error toast
      </Button>
    </div>
  );
}

export const Default: StoryObj = {
  render: () => (
    <ToastProvider>
      <ToastDemo />
    </ToastProvider>
  ),
};
