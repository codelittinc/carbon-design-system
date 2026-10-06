"use client";

import { useEffect, useId, useRef, useState, type ReactElement } from "react";
import { Check, ChevronDown, Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { Input } from "./input";
import { useCreateOption } from "./use-create-option";

export interface MultiSelectOption {
  value: string;
  label: string;
  sublabel?: string;
  disabled?: boolean;
}

interface MultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: MultiSelectOption[];
  placeholder?: string;
  /** Shown in the list when the search matches nothing. */
  emptyMessage?: React.ReactNode;
  disabled?: boolean;
  /** Put on the search input, so an external `<label htmlFor>` names it. */
  id?: string;
  ariaLabel?: string;
  className?: string;
  /**
   * Called on every keystroke in the search. When given, the caller owns the
   * filtering — fetch matching `options` from the server — and the list shows
   * `options` as passed instead of filtering them itself.
   */
  onSearchChange?: (query: string) => void;
  /** Shows "Loading…" in place of an empty list, while server results are on the way. */
  loading?: boolean;
  /**
   * Offers to create the typed value. It shows as the last option whenever the
   * trimmed search has no option with exactly that label (ignoring case), and
   * is called with the trimmed search. Add the new option to `options` and its
   * value to `value` yourself; the search clears once it resolves. While it is
   * pending the option is disabled, so a second Enter or press cannot create
   * twice. If it rejects, the search stays for another try, and the rejection
   * is swallowed: report the error yourself (a toast) before rethrowing.
   */
  onCreate?: (input: string) => void | Promise<void>;
  /** Text of the create option. Defaults to `Create "<input>"`. */
  createLabel?: (input: string) => React.ReactNode;
}

/**
 * A searchable list that toggles several values on and off. The list stays open
 * while choosing, so picking five people is five clicks, not five round trips.
 *
 * It shows no chips of its own: what is selected usually deserves more than a
 * chip (a status, a warning), so render the selection beside it — `Tag` with
 * `onRemove` is the usual fit. Backspace in an empty search removes the last
 * value.
 *
 * For a list searched on the server, pass `onSearchChange` and `loading`. To
 * let people add a value that is not there yet, pass `onCreate`.
 */
export function MultiSelect({
  value,
  onChange,
  options,
  placeholder = "Search…",
  emptyMessage = "No matches",
  disabled = false,
  id,
  ariaLabel,
  className,
  onSearchChange,
  loading = false,
  onCreate,
  createLabel = (input) => `Create "${input}"`,
}: MultiSelectProps): ReactElement {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlighted, setHighlighted] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listboxId = useId();

  const selected = new Set(value);
  const query = search.trim().toLowerCase();
  // With onSearchChange the server has already filtered `options`.
  const filtered =
    query && !onSearchChange
      ? options.filter((o) => o.label.toLowerCase().includes(query))
      : options;
  const trimmed = search.trim();
  const showCreate =
    !!onCreate && trimmed.length > 0 && !options.some((o) => o.label.toLowerCase() === query);
  // The create option sits after the options, at index `filtered.length`.
  const rowCount = filtered.length + (showCreate ? 1 : 0);

  // A ref as well as state: `close` also runs from the outside-click listener,
  // which would otherwise see the search as it was when the list opened.
  const searchRef = useRef(search);
  function updateSearch(next: string) {
    setSearch(next);
    if (next !== searchRef.current) onSearchChange?.(next);
    searchRef.current = next;
  }

  function close() {
    setOpen(false);
    updateSearch("");
    setHighlighted(-1);
  }

  const { creating, create: createOption } = useCreateOption(onCreate);
  function create() {
    return createOption(trimmed, () => {
      updateSearch("");
      setHighlighted(-1);
    });
  }

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) close();
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (highlighted < 0) return;
    const item = listRef.current?.querySelectorAll('[role="option"]')[highlighted];
    // jsdom has no layout, so no scrollIntoView.
    item?.scrollIntoView?.({ block: "nearest" });
  }, [highlighted]);

  function toggle(option: MultiSelectOption) {
    if (option.disabled) return;
    onChange(
      selected.has(option.value)
        ? value.filter((v) => v !== option.value)
        : [...value, option.value],
    );
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!open) setOpen(true);
        else setHighlighted((i) => Math.min(i + 1, rowCount - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlighted((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        if (open && filtered[highlighted]) {
          e.preventDefault();
          toggle(filtered[highlighted]);
        } else if (open && showCreate && highlighted === filtered.length) {
          e.preventDefault();
          void create();
        }
        break;
      case "Escape":
        if (open) {
          e.preventDefault();
          close();
        }
        break;
      case "Tab":
        close();
        break;
      case "Backspace":
        if (!search && value.length > 0) {
          e.preventDefault();
          onChange(value.slice(0, -1));
        }
        break;
    }
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Input
          id={id}
          type="text"
          role="combobox"
          aria-label={ariaLabel}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-controls={listboxId}
          value={search}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(e) => {
            updateSearch(e.target.value);
            setOpen(true);
            setHighlighted(-1);
          }}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          onKeyDown={onKeyDown}
          // Room for the chevron drawn over the right edge.
          className="pr-8"
        />
        <ChevronDown
          size={14}
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition-transform",
            open && "rotate-180",
          )}
        />
      </div>
      {open && !disabled && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-multiselectable="true"
          aria-busy={loading || undefined}
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-lg border border-border bg-surface-raised p-1 shadow-lg"
        >
          {filtered.length === 0 && !showCreate ? (
            <li className="px-2 py-3 text-center text-sm text-text-muted">
              {loading ? "Loading…" : emptyMessage}
            </li>
          ) : (
            filtered.map((option, index) => {
              const isSelected = selected.has(option.value);
              return (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={option.disabled || undefined}
                  // mousedown, not click: keeps focus in the input so the list
                  // stays open for the next pick.
                  onMouseDown={(e) => {
                    e.preventDefault();
                    toggle(option);
                  }}
                  onMouseEnter={() => setHighlighted(index)}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-text-secondary",
                    highlighted === index && "bg-surface-overlay text-text-primary",
                    isSelected && "text-text-primary",
                    option.disabled && "cursor-not-allowed opacity-50",
                  )}
                >
                  <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center text-accent-text">
                    {isSelected && <Check size={12} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{option.label}</span>
                    {option.sublabel && (
                      <span className="block truncate text-xs text-text-muted">
                        {option.sublabel}
                      </span>
                    )}
                  </span>
                </li>
              );
            })
          )}
          {showCreate && (
            <li
              role="option"
              aria-selected={false}
              aria-disabled={creating || undefined}
              onMouseDown={(e) => {
                e.preventDefault();
                void create();
              }}
              onMouseEnter={() => setHighlighted(filtered.length)}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-accent-text",
                highlighted === filtered.length && "bg-surface-overlay",
                creating && "cursor-wait opacity-50",
              )}
            >
              <Plus size={12} aria-hidden="true" className="shrink-0" />
              <span className="min-w-0 flex-1 truncate">{createLabel(trimmed)}</span>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
