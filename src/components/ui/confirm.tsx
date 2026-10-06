"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./alert-dialog";

export interface ConfirmOptions {
  title: ReactNode;
  description?: ReactNode;
  /** The action button. Defaults to "Confirm". */
  confirmLabel?: string;
  /** The button that backs out. Defaults to "Cancel". */
  cancelLabel?: string;
  /** Draws the action as a destructive button. */
  destructive?: boolean;
}

type Confirm = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<Confirm | null>(null);

interface Pending extends ConfirmOptions {
  resolve: (confirmed: boolean) => void;
}

/**
 * Hosts the dialog that `useConfirm` opens. Mount it once near the root,
 * beside `ToastProvider`.
 */
export function ConfirmProvider({ children }: { children: ReactNode }): ReactElement {
  const [pending, setPending] = useState<Pending | null>(null);
  const pendingRef = useRef<Pending | null>(null);
  // What had focus when `confirm()` was called, to give it back on close. A
  // ref, not part of `pending`: `settle` clears that before the dialog
  // unmounts and `onCloseAutoFocus` runs.
  const returnFocusRef = useRef<HTMLElement | null>(null);

  // Unmounted with a question open (a route change, say): the dialog is gone,
  // so the answer is "no", and the caller's await does not hang forever.
  useEffect(
    () => () => {
      pendingRef.current?.resolve(false);
      pendingRef.current = null;
    },
    [],
  );

  const settle = useCallback((confirmed: boolean) => {
    pendingRef.current?.resolve(confirmed);
    pendingRef.current = null;
    setPending(null);
  }, []);

  const confirm = useCallback<Confirm>(
    (options) =>
      new Promise<boolean>((resolve) => {
        // A second confirm while one is open answers the first "no".
        pendingRef.current?.resolve(false);
        // There is no AlertDialogTrigger for Radix to return focus to, so
        // remember what the caller's click or key press left focused.
        const active = document.activeElement;
        returnFocusRef.current = active instanceof HTMLElement && active !== document.body ? active : null;
        const next = { ...options, resolve };
        pendingRef.current = next;
        setPending(next);
      }),
    [],
  );

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AlertDialog
        open={pending !== null}
        onOpenChange={(open) => {
          // Escape and Cancel close it: that is a "no".
          if (!open) settle(false);
        }}
      >
        {pending && (
          <AlertDialogContent
            onCloseAutoFocus={(event) => {
              // Back to the control that asked, if it is still on the page
              // (a deleted row's button may not be), instead of <body>.
              event.preventDefault();
              const el = returnFocusRef.current;
              returnFocusRef.current = null;
              if (el?.isConnected) el.focus();
            }}
          >
            <AlertDialogHeader>
              <AlertDialogTitle>{pending.title}</AlertDialogTitle>
              {pending.description && <AlertDialogDescription>{pending.description}</AlertDialogDescription>}
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{pending.cancelLabel ?? "Cancel"}</AlertDialogCancel>
              <AlertDialogAction tone={pending.destructive ? "destructive" : "default"} onClick={() => settle(true)}>
                {pending.confirmLabel ?? "Confirm"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        )}
      </AlertDialog>
    </ConfirmContext.Provider>
  );
}

/**
 * Asks before doing something, in an `AlertDialog`, and resolves to the
 * answer — `window.confirm` in the design system's own dialog:
 *
 * ```tsx
 * const confirm = useConfirm();
 * async function remove() {
 *   if (!(await confirm({ title: "Delete this contract?", confirmLabel: "Delete", destructive: true }))) return;
 *   await deleteContract(id);
 * }
 * ```
 *
 * Resolves `true` for the action, `false` for Cancel or Escape. Needs a
 * `ConfirmProvider` above it, and throws without one rather than answering a
 * question nobody was shown.
 */
export function useConfirm(): Confirm {
  const confirm = useContext(ConfirmContext);
  if (!confirm) throw new Error("useConfirm needs a <ConfirmProvider> above it.");
  return confirm;
}
