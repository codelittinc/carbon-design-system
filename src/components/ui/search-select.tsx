"use client";

import { useState, useEffect, useRef, useCallback, useId } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

interface SearchSelectOption {
  value: string;
  label: string;
  sublabel?: string;
}

interface SearchSelectProps {
  value: string | null;
  onChange: (value: string | null) => void;
  onSearch: (query: string) => void;
  options: SearchSelectOption[];
  loading?: boolean;
  placeholder?: string;
  className?: string;
  /**
   * Override styling of the trigger `<button>`. Merged after the default
   * classes via `cn`, so a consumer can restyle the control for a differently
   * themed surface (e.g. a light-themed public page).
   */
  triggerClassName?: string;
  /** Override styling of the dropdown panel. Merged after the defaults via `cn`. */
  contentClassName?: string;
  /** Override styling of each option `<button>`. Merged after the defaults via `cn`. */
  optionClassName?: string;
  clearable?: boolean;
  renderOption?: (option: SearchSelectOption) => React.ReactNode;
  /**
   * Open the dropdown and focus the search input on mount. Used inside dialogs
   * so a keyboard user can type a name immediately — without this the closed
   * trigger button takes focus (it looks highlighted but can't be typed into).
   */
  autoFocus?: boolean;
}

export function SearchSelect({
  value,
  onChange,
  onSearch,
  options,
  loading = false,
  placeholder = "Search...",
  className,
  triggerClassName,
  contentClassName,
  optionClassName,
  clearable = true,
  renderOption,
  autoFocus = false,
}: SearchSelectProps) {
  // Start open when auto-focusing so the search input is rendered on the first
  // paint and can receive focus (the input only exists in the DOM while open).
  const [open, setOpen] = useState(autoFocus);
  const [query, setQuery] = useState("");
  // Index of the keyboard-active option (-1 = none). Distinct from the selected
  // value: it tracks where arrow-key focus is within the current list.
  const [activeIndex, setActiveIndex] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const listboxId = useId();
  const optionId = (i: number) => `${listboxId}-option-${i}`;

  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset the active option whenever the list content changes (new search
  // results), so a stale index never points past the end of the new list.
  // Opening/closing sets the active index explicitly (see openList/closeList),
  // so `open` is intentionally not a dependency here — otherwise it would clobber
  // the index we set when opening via an arrow key.
  useEffect(() => {
    setActiveIndex(-1);
  }, [options]);

  // Keep the active option scrolled into view as the user arrows through.
  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(
      `#${CSS.escape(optionId(activeIndex))}`,
    );
    el?.scrollIntoView({ block: "nearest" });
    // optionId is stable for a given listboxId; intentionally omitted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  // Open the list, move focus into the search input, and set which option is
  // active. `activeTo` is clamped by the caller to a valid index or -1 (none).
  const openList = useCallback((activeTo: number) => {
    setOpen(true);
    setActiveIndex(activeTo);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  // Close the list and return focus to the trigger, so a keyboard user has a
  // useful continuation point instead of focus falling back to <body> when the
  // search input unmounts.
  const closeList = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  const handleQueryChange = useCallback(
    (q: string) => {
      setQuery(q);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => onSearch(q), 300);
    },
    [onSearch],
  );

  const handleSelect = useCallback(
    (val: string) => {
      onChange(val);
      setQuery("");
      closeList();
    },
    [onChange, closeList],
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(null);
      setQuery("");
    },
    [onChange],
  );

  // Close when focus leaves the widget (e.g. Tab to the next page control), so
  // the popup doesn't linger open with aria-expanded="true" after focus exits.
  const handleBlur = useCallback((e: React.FocusEvent) => {
    const next = e.relatedTarget as Node | null;
    if (next) {
      // Fast path: we know where focus went. Keep the list open only while
      // focus stays inside the widget (input, trigger, or an option).
      if (!ref.current?.contains(next)) setOpen(false);
      return;
    }
    // No relatedTarget — focus moved to browser chrome, was cleared
    // programmatically, or a browser-specific transition. Defer to the next
    // tick and inspect where focus actually settled, so we still close when
    // focus has left the widget. An option click focuses the option (inside the
    // widget) and closes via its own onClick before this callback runs, so it
    // isn't dismissed early.
    setTimeout(() => {
      if (ref.current && !ref.current.contains(document.activeElement)) {
        setOpen(false);
      }
    }, 0);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          if (!open) {
            // Open with the first option active, so ArrowDown then Enter selects it.
            openList(options.length ? 0 : -1);
            return;
          }
          if (options.length === 0) return;
          setActiveIndex((i) => (i + 1) % options.length);
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          if (!open) {
            // Open with the last option active (matches the wrap-around below).
            openList(options.length ? options.length - 1 : -1);
            return;
          }
          if (options.length === 0) return;
          // From no active option (-1), ArrowUp wraps to the last option.
          setActiveIndex((i) => (i <= 0 ? options.length - 1 : i - 1));
          break;
        }
        case "Enter": {
          if (open && activeIndex >= 0 && options[activeIndex]) {
            e.preventDefault();
            handleSelect(options[activeIndex].value);
          }
          break;
        }
        case "Escape": {
          if (open) {
            e.preventDefault();
            closeList();
          }
          break;
        }
      }
    },
    [open, options, activeIndex, openList, closeList, handleSelect],
  );

  return (
    <div ref={ref} onBlur={handleBlur} className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        onKeyDown={handleKeyDown}
        onClick={() => (open ? closeList() : openList(-1))}
        className={cn(
          "flex h-8 w-full items-center justify-between rounded-md border border-border bg-surface-raised px-3 text-sm transition-colors hover:border-text-faint focus:outline-none focus:ring-2 focus:ring-accent/50",
          triggerClassName,
        )}
      >
        <span className={selectedOption ? "text-text-primary" : "text-text-muted"}>
          {selectedOption?.label ?? placeholder}
        </span>
        <div className="flex items-center gap-1">
          {clearable && value && (
            <span
              role="button"
              tabIndex={-1}
              onClick={handleClear}
              className="rounded p-0.5 text-text-muted hover:text-text-primary"
            >
              <X size={12} />
            </span>
          )}
          <ChevronDown size={14} className="text-text-muted" />
        </div>
      </button>

      {open && (
        <div
          className={cn(
            "absolute left-0 top-full z-50 mt-1 w-full min-w-[240px] rounded-lg border border-border bg-surface-raised shadow-lg",
            contentClassName,
          )}
        >
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search size={14} className="text-text-muted" />
            <input
              ref={inputRef}
              autoFocus={autoFocus}
              type="text"
              role="combobox"
              aria-expanded={open}
              aria-controls={listboxId}
              aria-autocomplete="list"
              aria-activedescendant={
                activeIndex >= 0 ? optionId(activeIndex) : undefined
              }
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
            />
          </div>
          <div ref={listRef} role="listbox" id={listboxId} className="max-h-60 overflow-y-auto py-1">
            {loading ? (
              <div className="px-3 py-4 text-center text-sm text-text-muted">Searching...</div>
            ) : options.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-text-muted">No results</div>
            ) : (
              options.map((option, i) => (
                <button
                  key={option.value}
                  id={optionId(i)}
                  role="option"
                  aria-selected={option.value === value}
                  type="button"
                  // Focus stays on the combobox input (active-descendant pattern);
                  // keep options out of the Tab sequence so Tab leaves the widget.
                  tabIndex={-1}
                  onClick={() => handleSelect(option.value)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={cn(
                    "flex w-full items-center px-3 py-1.5 text-left text-sm text-text-primary transition-colors hover:bg-surface-overlay",
                    i === activeIndex && "bg-surface-overlay",
                    option.value === value && "bg-accent-muted text-accent-text",
                    optionClassName,
                  )}
                >
                  {renderOption ? (
                    renderOption(option)
                  ) : (
                    <div>
                      <div>{option.label}</div>
                      {option.sublabel && (
                        <div className="text-xs text-text-muted">{option.sublabel}</div>
                      )}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
