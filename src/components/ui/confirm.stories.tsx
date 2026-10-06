import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button } from "./button";
import { ConfirmProvider, useConfirm } from "./confirm";

/**
 * `useConfirm()` asks in an AlertDialog and resolves to the answer: true for
 * the action, false for Cancel or Escape. Mount `ConfirmProvider` once near
 * the root.
 */
const meta: Meta = {
  title: "Components/Overlays/Confirm",
  tags: ["autodocs"],
  decorators: [(Story) => <ConfirmProvider>{Story()}</ConfirmProvider>],
};
export default meta;

function Demo({ destructive }: { destructive?: boolean }) {
  const confirm = useConfirm();
  const [answer, setAnswer] = useState<string>("—");
  return (
    <div className="flex items-center gap-3">
      <Button
        variant={destructive ? "outline" : "default"}
        tone={destructive ? "destructive" : "default"}
        onClick={async () => {
          const ok = await confirm(
            destructive
              ? {
                  title: "Delete this contract?",
                  description: "Its hours stay, but the contract cannot be restored.",
                  confirmLabel: "Delete",
                  destructive: true,
                }
              : { title: "Send the invoice?", confirmLabel: "Send" },
          );
          setAnswer(ok ? "confirmed" : "cancelled");
        }}
      >
        {destructive ? "Delete contract" : "Send invoice"}
      </Button>
      <span className="text-sm text-text-muted">Answer: {answer}</span>
    </div>
  );
}

export const Default: StoryObj = { render: () => <Demo /> };

export const Destructive: StoryObj = { render: () => <Demo destructive /> };
