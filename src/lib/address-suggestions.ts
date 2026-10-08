import type { AddressSuggestionProvider } from "@/components/ui/address-combobox-types";
/** Bound provider latency even when a custom provider ignores cancellation. */
export async function fetchAddressSuggestions(
  provider: AddressSuggestionProvider,
  query: string,
  signal: AbortSignal,
) {
  const controller = new AbortController();
  let rejectCancellation!: (reason: Error) => void;
  const cancelled = new Promise<never>((_, reject) => {
    rejectCancellation = reject;
  });
  const cancel = () => {
    controller.abort();
    rejectCancellation(new Error("Address lookup cancelled"));
  };
  signal.addEventListener("abort", cancel, { once: true });
  const timer = setTimeout(cancel, 10000);
  try {
    if (signal.aborted) {
      cancel();
      return await cancelled;
    }
    const result = await Promise.race([
      Promise.resolve().then(() =>
        provider(query, { signal: controller.signal }),
      ),
      cancelled,
    ]);
    return result.slice(0, 5);
  } finally {
    clearTimeout(timer);
    signal.removeEventListener("abort", cancel);
  }
}
