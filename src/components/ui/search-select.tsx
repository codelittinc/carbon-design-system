"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  clearable?: boolean;
  renderOption?: (option: SearchSelectOption) => React.ReactNode;
}

export function SearchSelect({
  value,
  onChange,
  onSearch,
  options,
  loading = false,
  placeholder = "Search...",
  className,
  clearable = true,
  renderOption,
}: SearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
      setOpen(false);
      setQuery("");
    },
    [onChange],
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(null);
      setQuery("");
    },
    [onChange],
  );

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => {
          setOpen(!open);
          if (!open) setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className="flex h-8 w-full items-center justify-between rounded-md border border-border bg-surface-raised px-3 text-sm transition-colors hover:border-carbon-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
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
        <div className="absolute left-0 top-full z-50 mt-1 w-full min-w-[240px] rounded-lg border border-border bg-surface-raised shadow-lg">
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search size={14} className="text-text-muted" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder={placeholder}
              className="flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
            />
          </div>
          <div className="max-h-60 overflow-y-auto py-1">
            {loading ? (
              <div className="px-3 py-4 text-center text-sm text-text-muted">Searching...</div>
            ) : options.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-text-muted">No results</div>
            ) : (
              options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "flex w-full items-center px-3 py-1.5 text-left text-sm transition-colors hover:bg-surface-overlay",
                    option.value === value && "bg-amber-500/10 text-amber-400",
                  )}
                >
                  {renderOption ? (
                    renderOption(option)
                  ) : (
                    <div>
                      <div className="text-text-primary">{option.label}</div>
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
