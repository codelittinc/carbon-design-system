"use client";

import { useRef, useState } from "react";

/**
 * The "Create …" option shared by `SearchSelect` and `MultiSelect`. Internal:
 * not exported from the package.
 *
 * One create at a time: a second Enter or click while `onCreate` is still
 * pending does nothing (the ref closes the gap before the state re-renders),
 * and `creating` lets the row show itself disabled. `onSuccess` runs once it
 * resolves. A rejection is swallowed after resetting, leaving the typed text
 * for another try: the consumer reports its own error, and an unhandled
 * rejection from a click handler would reach no one.
 */
export function useCreateOption(onCreate: ((input: string) => void | Promise<void>) | undefined): {
  creating: boolean;
  create: (input: string, onSuccess: () => void) => Promise<void>;
} {
  const inFlight = useRef(false);
  const [creating, setCreating] = useState(false);

  async function create(input: string, onSuccess: () => void): Promise<void> {
    if (!onCreate || !input || inFlight.current) return;
    inFlight.current = true;
    setCreating(true);
    let created = false;
    try {
      await onCreate(input);
      created = true;
    } catch {
      // Reported by the consumer; see above.
    } finally {
      inFlight.current = false;
      setCreating(false);
    }
    if (created) onSuccess();
  }

  return { creating, create };
}
