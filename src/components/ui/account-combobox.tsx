"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

export interface AccountOption {
  id: string;
  accountNumber: string;
  name: string;
}

interface AccountComboboxProps {
  accounts: AccountOption[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  /**
   * "default" renders a bordered form field (reports, filters).
   * "inline" renders a borderless, transparent field that sits inside a
   * dense table cell (journal-entry line items).
   */
  variant?: "default" | "inline";
  /** Show a clear (X) affordance when a value is selected. */
  clearable?: boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
}

/**
 * Type-to-search account picker. Filters the full chart of accounts by account
 * number OR name (e.g. "5730" or "prepaid"), is keyboard navigable, and renders
 * "1-5730-0000 — Plus: Prepaid Rent" style rows. Client-side filtering only —
 * pass the already-loaded account list. Replaces the unusable native <select>
 * over ~240 accounts.
 */
export function AccountCombobox({
  accounts,
  value,
  onChange,
  placeholder = "Search account…",
  variant = "default",
  clearable = false,
  disabled = false,
  id,
  className,
}: AccountComboboxProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selected = accounts.find((a) => a.id === value);

  const filtered = useMemo(() => {
    if (!query) return accounts;
    const q = query.toLowerCase();
    return accounts.filter(
      (a) =>
        a.accountNumber.toLowerCase().includes(q) || a.name.toLowerCase().includes(q),
    );
  }, [accounts, query]);

  useEffect(() => {
    setHighlightIdx(0);
  }, [query]);

  useEffect(() => {
    const el = listRef.current?.children[highlightIdx] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [highlightIdx]);

  const selectAccount = useCallback(
    (accountId: string) => {
      onChange(accountId);
      setQuery("");
      setIsOpen(false);
      inputRef.current?.blur();
    },
    [onChange],
  );

  const clear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange("");
      setQuery("");
      setIsOpen(false);
    },
    [onChange],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }
    if (e.key === "ArrowDown") {
      setHighlightIdx((i) => Math.min(i + 1, filtered.length - 1));
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      setHighlightIdx((i) => Math.max(i - 1, 0));
      e.preventDefault();
    } else if (e.key === "Enter") {
      if (filtered[highlightIdx]) selectAccount(filtered[highlightIdx].id);
      e.preventDefault();
    } else if (e.key === "Escape" || e.key === "Tab") {
      setIsOpen(false);
      setQuery("");
    }
  };

  const inputClasses =
    variant === "inline"
      ? cn(
          "h-7 w-full rounded border-0 bg-transparent px-1 text-xs focus:ring-1 focus:ring-amber-500/50",
          selected ? "text-text-primary" : "text-text-faint",
        )
      : cn(
          "h-8 w-full rounded-md border border-border bg-surface-raised px-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/50",
          clearable && selected ? "pr-8" : "",
          selected ? "text-text-primary" : "text-text-muted",
        );

  return (
    <div className={cn("relative", className)}>
      <input
        id={id}
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-autocomplete="list"
        data-1p-ignore
        autoComplete="off"
        disabled={disabled}
        value={isOpen ? query : selected ? `${selected.accountNumber} — ${selected.name}` : ""}
        placeholder={placeholder}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => {
          setIsOpen(true);
          setQuery("");
        }}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        onKeyDown={handleKeyDown}
        className={inputClasses}
      />
      {clearable && selected && !isOpen && variant === "default" && (
        <button
          type="button"
          aria-label="Clear account"
          onClick={clear}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-text-muted hover:text-text-primary"
        >
          <X size={14} />
        </button>
      )}
      {isOpen && (
        <div
          ref={listRef}
          role="listbox"
          className="absolute left-0 top-full z-50 mt-1 max-h-60 w-full min-w-[18rem] overflow-y-auto rounded-md border border-border bg-surface-raised shadow-lg"
        >
          {filtered.length === 0 ? (
            <div className="px-2 py-1.5 text-xs text-text-faint">No matching accounts</div>
          ) : (
            filtered.slice(0, 50).map((a, i) => (
              <button
                key={a.id}
                type="button"
                role="option"
                aria-selected={a.id === value}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectAccount(a.id)}
                className={cn(
                  "flex w-full items-center gap-2 px-2 py-1.5 text-left text-xs hover:bg-surface-overlay",
                  i === highlightIdx && "bg-surface-overlay",
                  a.id === value && "text-amber-400",
                )}
              >
                <span className="shrink-0 font-[family-name:var(--font-mono)] text-amber-400">
                  {a.accountNumber}
                </span>
                <span className="truncate text-text-primary">{a.name}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
