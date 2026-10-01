"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "./button";

type ToastVariant = "default" | "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
}

type ToastInput = Omit<Toast, "id">;

interface ToastContextValue {
  toast: (t: ToastInput) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

/**
 * Every mounted ToastProvider, so the imperative `toast` below can reach one
 * from code that is not inside a component — an event handler in a module, a
 * server-action result handled after an `await`, a helper that is not a hook.
 */
const listeners = new Set<(t: ToastInput) => void>();

function emit(t: ToastInput) {
  listeners.forEach((listener) => listener(t));
}

type ToastOptions = Pick<ToastInput, "description">;

/**
 * Fire a toast without `useToast()`. Shows in whichever `ToastProvider` is
 * mounted; with none mounted it is a no-op, the same as `useToast()` outside a
 * provider.
 *
 * ```ts
 * toast.success("Saved");
 * toast.error("Couldn't save", { description: res.error });
 * ```
 */
export const toast = Object.assign((t: ToastInput) => emit(t), {
  success: (title: string, options?: ToastOptions) =>
    emit({ title, ...options, variant: "success" }),
  error: (title: string, options?: ToastOptions) => emit({ title, ...options, variant: "error" }),
  info: (title: string, options?: ToastOptions) => emit({ title, ...options, variant: "info" }),
  warning: (title: string, options?: ToastOptions) =>
    emit({ title, ...options, variant: "warning" }),
});

const variantClasses: Record<ToastVariant, string> = {
  default: "border-border bg-surface-raised",
  success: "border-success-border bg-success-soft",
  error: "border-error-border bg-error-soft",
  info: "border-border bg-info-soft",
  warning: "border-border bg-accent-muted",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((t: ToastInput) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  useEffect(() => {
    listeners.add(addToast);
    return () => {
      listeners.delete(addToast);
    };
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2"
        role="region"
        aria-label="Notifications"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.variant === "error" ? "alert" : "status"}
            className={cn(
              "flex w-80 items-start gap-3 rounded-lg border px-4 py-3 shadow-lg animate-in slide-in-from-right",
              variantClasses[t.variant ?? "default"],
            )}
          >
            <div className="flex-1">
              <p className="text-sm font-medium text-text-primary">{t.title}</p>
              {t.description && (
                <p className="mt-0.5 text-xs text-text-muted">{t.description}</p>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Dismiss"
              onClick={() => removeToast(t.id)}
              className="-mr-1 -mt-0.5 h-6 w-6 text-text-muted hover:bg-transparent"
            >
              <X size={14} />
            </Button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
