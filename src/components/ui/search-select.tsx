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
  /**
   * Fires immediately on every keystroke, un-debounced — before the debounced
   * `onSearch`. Use it when editing the query must take effect at once rather
   * than after the debounce, e.g. to invalidate a prior selection the moment the
   * user starts typing a replacement (so a stale value can't be submitted during
   * the debounce window). `onSearch` remains the throttled hook for the actual
   * fetch.
   */
  onQueryChange?: (query: string) => void;
  options: SearchSelectOption[];
  loading?: boolean;
  placeholder?: string;
  className?: string;
  /**
   * Applied to the trigger `<button>`, so an external `<label htmlFor={id}>` can
   * name the control (the trigger is a labelable button). Without it the label
   * has nothing to bind to and assistive tech can't announce the field.
   *
   * Note: an external `<label htmlFor={id}>` only names the *trigger*. Once the
   * dropdown opens, focus moves to the search `combobox` input, which the label
   * can't reach — so it would be announced by its placeholder ("Search…")
   * instead of the field name. Pass `ariaLabel` to name both elements.
   */
  id?: string;
  /**
   * Accessible name applied as `aria-label` to *both* the trigger `<button>` and
   * the search `combobox` input. Use this so the field is announced with the same
   * name whether focus is on the closed trigger or the opened input — an external
   * `<label htmlFor={id}>` only reaches the trigger.
   */
  ariaLabel?: string;
  /**
   * Marks the field as required. Because the field has two focusable states, the
   * required state is conveyed in both:
   * - the `combobox` input (focused while open) gets `aria-required` — the
   *   supported state for the combobox role;
   * - the trigger `<button>` (focused while closed, the field's resting state)
   *   gets `aria-describedby` pointing to a visually-hidden "Required" hint,
   *   since `aria-required` is not a supported state on the `button` role.
   * Without the trigger hint, assistive tech couldn't discover the requirement
   * until the user opened the dropdown.
   */
  required?: boolean;
  /**
   * Screen-reader text describing the required state on the closed trigger
   * (referenced via `aria-describedby`). Override to localize. Only rendered
   * when `required` is set.
   */
  requiredLabel?: string;
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
  onQueryChange,
  options,
  loading = false,
  placeholder = "Search...",
  className,
  id,
  ariaLabel,
  required,
  requiredLabel = "Required",
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
  // Describes the closed trigger as required (aria-required is invalid on the
  // button role, so the state is exposed as a description instead).
  const requiredHintId = `${listboxId}-required`;

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
      // Immediate, un-debounced signal for consumers that must react to the edit
      // at once (e.g. invalidating a prior selection); onSearch stays debounced.
      onQueryChange?.(q);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => onSearch(q), 300);
    },
    [onSearch, onQueryChange],
  );

  // Selecting or clearing abandons any in-flight query: cancel the pending
  // debounced onSearch so it can't fire afterwards and hand the parent a query
  // whose result set omits the just-chosen option — which would blank the
  // trigger while the value stays selected (and submittable).
  const cancelPendingSearch = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  const handleSelect = useCallback(
    (val: string) => {
      cancelPendingSearch();
      onChange(val);
      setQuery("");
      closeList();
    },
    [onChange, closeList, cancelPendingSearch],
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      cancelPendingSearch();
      onChange(null);
      setQuery("");
    },
    [onChange, cancelPendingSearch],
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
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        aria-describedby={required ? requiredHintId : undefined}
        aria-controls={open ? listboxId : undefined}
        onKeyDown={handleKeyDown}
        onClick={() => (open ? closeList() : openList(-1))}
        className={cn(
          "flex h-8 w-full min-w-0 items-center justify-between rounded-md border border-border bg-surface-raised px-3 text-sm transition-colors hover:border-text-faint focus:outline-none focus:ring-2 focus:ring-accent/50",
          triggerClassName,
        )}
      >
        {/*
         * `min-w-0 truncate` for the same reason as `SelectTrigger`: this span is a flex item,
         * so its default `min-width: auto` would hold it at full text width and push the icons
         * out through the right border instead of clipping. A searchable select is exactly where
         * long labels arrive, since its options come from a query rather than a fixed list.
         */}
        <span
          className={cn(
            "min-w-0 truncate",
            selectedOption ? "text-text-primary" : "text-text-muted",
          )}
        >
          {selectedOption?.label ?? placeholder}
        </span>
        {/* shrink-0: the clear button and chevron keep their size; the label is what gives. */}
        <div className="flex shrink-0 items-center gap-1">
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

      {required && (
        <span id={requiredHintId} className="sr-only">
          {requiredLabel}
        </span>
      )}

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
              aria-label={ariaLabel}
              aria-required={required || undefined}
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
