"use client";

import { useState, useEffect, useRef, useCallback, useId, type ReactElement, type ReactNode } from "react";
import { Search, X, ChevronDown, Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  fieldChromeClass,
  floatingSurfaceClass,
  optionRowActiveClass,
  optionRowClass,
} from "@/lib/ui-classes";
import { useCreateOption } from "./use-create-option";

export interface SearchSelectOption {
  value: string;
  label: string;
  sublabel?: string;
  /** Shown but not selectable; the arrow keys pass over it. */
  disabled?: boolean;
  /**
   * Drawn before the label, in the option's row and in the trigger while it is
   * the chosen one — a logo or a `<Monogram size="xs" />`. Decorative: the
   * label is still what names the option.
   */
  media?: ReactNode;
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
  /**
   * The chosen option, for the trigger to show when it is not in `options` —
   * a value loaded with the record, before any search has run, or one the
   * latest search no longer returns. Without it such a value shows the
   * placeholder. An entry in `options` with the same value wins.
   */
  selectedOption?: SearchSelectOption | null;
  /** Disables the trigger, so the list cannot open. */
  disabled?: boolean;
  loading?: boolean;
  placeholder?: string;
  /** Shown in the list when there are no options. Defaults to "No results". */
  emptyMessage?: React.ReactNode;
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
  /**
   * Offers to create the typed value. It shows as the last option whenever the
   * trimmed query has no option with exactly that label (ignoring case), and is
   * hidden while `loading`. Called with the trimmed query; select the new
   * record yourself (`value`, and an `options` entry for its label). The list
   * closes once it resolves. While it is pending the option is disabled, so a
   * second Enter or click cannot create twice. If it rejects, the list stays
   * open with the query for another try, and the rejection is swallowed:
   * report the error yourself (a toast) before rethrowing.
   */
  onCreate?: (input: string) => void | Promise<void>;
  /** Text of the create option. Defaults to `Create "<input>"`. */
  createLabel?: (input: string) => React.ReactNode;
}

export function SearchSelect({
  value,
  onChange,
  onSearch,
  onQueryChange,
  options,
  selectedOption: selectedOptionProp,
  disabled = false,
  loading = false,
  placeholder = "Search...",
  emptyMessage = "No results",
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
  onCreate,
  createLabel = (input) => `Create "${input}"`,
}: SearchSelectProps): ReactElement {
  // Start open when auto-focusing so the search input is rendered on the first
  // paint and can receive focus (the input only exists in the DOM while open).
  const [open, setOpen] = useState(autoFocus);
  // Disabling closes the list for good: enabling it again does not reopen it.
  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);
  // The list as shown. `open` can lag a render behind `disabled`.
  const expanded = open && !disabled;
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

  const selectedOption =
    options.find((o) => o.value === value) ??
    (value != null && selectedOptionProp?.value === value ? selectedOptionProp : undefined);


  const trimmed = query.trim();
  const showCreate =
    !!onCreate &&
    !loading &&
    trimmed.length > 0 &&
    !options.some((o) => o.label.toLowerCase() === trimmed.toLowerCase());
  // The create option sits after the options, at index `options.length`.
  // The rows the arrow keys stop on: every option but a disabled one, then the
  // create option.
  const navigable = [
    ...options.flatMap((o, i) => (o.disabled ? [] : [i])),
    ...(showCreate ? [options.length] : []),
  ];
  const firstOption = navigable.find((i) => i < options.length) ?? -1;
  const lastOption = [...navigable].reverse().find((i) => i < options.length) ?? -1;
  /** The navigable row `step` rows from `from`, wrapping at the ends. */
  const stepFrom = (from: number, step: 1 | -1): number => {
    if (navigable.length === 0) return -1;
    const at = navigable.indexOf(from);
    if (at === -1) return step === 1 ? navigable[0] : navigable[navigable.length - 1];
    return navigable[(at + step + navigable.length) % navigable.length];
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset the active option whenever the list CONTENT changes (new search
  // results), so a stale index never points past the end of the new list.
  //
  // Keyed on the option values, not on the `options` array's identity. A
  // consumer that builds its options inline (`items.map(...)`) or filters on a
  // debounced query hands over a new array with the same rows on every render;
  // keyed on identity, that wiped the row the user had just arrowed to, and
  // Enter then had nothing to select.
  //
  // Opening/closing sets the active index explicitly (see openList/closeList),
  // so `open` is intentionally not a dependency here — otherwise it would clobber
  // the index we set when opening via an arrow key.
  const optionsKey = options.map((o) => o.value).join("\u0000");
  useEffect(() => {
    setActiveIndex(-1);
  }, [optionsKey]);

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

  const { creating, create } = useCreateOption(onCreate);
  const handleCreate = useCallback(async () => {
    cancelPendingSearch();
    await create(trimmed, () => {
      setQuery("");
      closeList();
    });
  }, [create, trimmed, cancelPendingSearch, closeList]);

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
            openList(firstOption);
            return;
          }
          setActiveIndex((i) => stepFrom(i, 1));
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          if (!open) {
            // Open with the last option active (matches the wrap-around below).
            openList(lastOption);
            return;
          }
          // From no active option (-1), ArrowUp wraps to the last row.
          setActiveIndex((i) => stepFrom(i, -1));
          break;
        }
        case "Enter": {
          // While the list is open, Enter belongs to the list: it picks the
          // active option, or does nothing when none is active. It must never
          // fall through as the implicit submit of a surrounding <form> — the
          // user is choosing a value, not sending the form. A closed trigger
          // is a type="button", so Enter there opens the list as a click does.
          // The create option (index `options.length`) is a row like any other.
          if (open) {
            e.preventDefault();
            if (activeIndex >= 0 && options[activeIndex] && !options[activeIndex].disabled) {
              handleSelect(options[activeIndex].value);
            } else if (showCreate && activeIndex === options.length) {
              void handleCreate();
            }
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
    // stepFrom, firstOption and lastOption derive from options and showCreate.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open, options, activeIndex, openList, closeList, handleSelect, showCreate, handleCreate],
  );

  /*
   * `min-w-0 truncate` for the same reason as `SelectTrigger`: this span is a flex item,
   * so its default `min-width: auto` would hold it at full text width and push the icons
   * out through the right border instead of clipping. A searchable select is exactly where
   * long labels arrive, since its options come from a query rather than a fixed list.
   */
  const triggerLabel = (
    <span className={cn("min-w-0 truncate", selectedOption ? "text-text-primary" : "text-text-muted")}>
      {selectedOption?.label ?? placeholder}
    </span>
  );

  return (
    <div ref={ref} onBlur={handleBlur} className={cn("relative", className)}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={expanded}
        aria-label={ariaLabel}
        aria-describedby={required ? requiredHintId : undefined}
        aria-controls={expanded ? listboxId : undefined}
        disabled={disabled}
        onKeyDown={handleKeyDown}
        onClick={() => (open ? closeList() : openList(-1))}
        className={cn(
          fieldChromeClass,
          "flex h-8 items-center justify-between px-3 hover:border-text-faint disabled:hover:border-border",
          triggerClassName,
        )}
      >
        {selectedOption?.media ? (
          <span className="flex min-w-0 items-center gap-2">
            {selectedOption.media}
            {triggerLabel}
          </span>
        ) : (
          triggerLabel
        )}
        {/* shrink-0: the clear button and chevron keep their size; the label is what gives. */}
        <div className="flex shrink-0 items-center gap-1">
          {clearable && value && !disabled && (
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

      {expanded && (
        <div
          className={cn(
            floatingSurfaceClass,
            "absolute left-0 top-full mt-1 w-full min-w-[240px]",
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
          <div ref={listRef} role="listbox" id={listboxId} className="max-h-60 overflow-y-auto p-1">
            {loading ? (
              <div className="px-3 py-4 text-center text-sm text-text-muted">Searching...</div>
            ) : options.length === 0 && !showCreate ? (
              <div className="px-3 py-4 text-center text-sm text-text-muted">{emptyMessage}</div>
            ) : (
              options.map((option, i) => (
                <button
                  key={option.value}
                  id={optionId(i)}
                  role="option"
                  aria-selected={option.value === value}
                  aria-disabled={option.disabled || undefined}
                  type="button"
                  // Focus stays on the combobox input (active-descendant pattern);
                  // keep options out of the Tab sequence so Tab leaves the widget.
                  tabIndex={-1}
                  onClick={() => {
                    if (!option.disabled) handleSelect(option.value);
                  }}
                  onMouseEnter={() => {
                    if (!option.disabled) setActiveIndex(i);
                  }}
                  className={cn(
                    optionRowClass,
                    "text-text-primary hover:bg-surface-overlay",
                    i === activeIndex && optionRowActiveClass,
                    option.value === value && "bg-accent-muted text-accent-text",
                    option.disabled && "cursor-not-allowed opacity-50 hover:bg-transparent",
                    optionClassName,
                  )}
                >
                  {renderOption ? (
                    renderOption(option)
                  ) : (
                    <>
                      {option.media}
                      <div className="min-w-0">
                        <div>{option.label}</div>
                        {option.sublabel && (
                          <div className="text-xs text-text-muted">{option.sublabel}</div>
                        )}
                      </div>
                    </>
                  )}
                </button>
              ))
            )}
            {showCreate && (
              <button
                id={optionId(options.length)}
                role="option"
                aria-selected={false}
                aria-disabled={creating || undefined}
                type="button"
                tabIndex={-1}
                onClick={() => void handleCreate()}
                onMouseEnter={() => setActiveIndex(options.length)}
                className={cn(
                  optionRowClass,
                  "text-accent-text hover:bg-surface-overlay",
                  activeIndex === options.length && "bg-surface-overlay",
                  creating && "cursor-wait opacity-50",
                  optionClassName,
                )}
              >
                <Plus size={12} aria-hidden="true" className="shrink-0" />
                <span className="min-w-0 truncate">{createLabel(trimmed)}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
