"use client";

import { useEffect, useId, useRef, useState } from "react";
import { loadGooglePlacesLibrary } from "@/lib/google-places";
import { cn } from "@/lib/cn";
import { Input } from "./input";
import { parseGooglePlaceAddress, type PostalAddressDraft } from "./postal-address";

const SEARCH_DELAY_MS = 250;
const MIN_QUERY_LENGTH = 3;

interface AddressAutocompleteProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onAddressSelect?: (address: PostalAddressDraft) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  variant?: "staff" | "public" | "vendor";
  ariaLabel?: string;
  required?: boolean;
  autoComplete?: string;
}

type Suggestion = google.maps.places.AutocompleteSuggestion;

function predictionText(prediction: google.maps.places.PlacePrediction) {
  return {
    main: prediction.mainText?.toString() || prediction.text.toString(),
    secondary: prediction.secondaryText?.toString() || "",
  };
}

/**
 * Google Places (New API) address autocomplete. Debounces input, streams
 * suggestions, and — when `onAddressSelect` is provided — resolves the chosen
 * prediction into a structured {@link PostalAddressDraft}. Degrades to manual
 * entry (with a retry affordance) when Places is unconfigured or unreachable.
 * Three visual variants cover the dark staff app, the public marketing site,
 * and the light vendor portal.
 */
export function AddressAutocomplete({
  id,
  value,
  onChange,
  onAddressSelect,
  onBlur,
  placeholder = "Start typing an address...",
  className,
  variant = "staff",
  ariaLabel = "Address search",
  required = false,
  autoComplete = "street-address",
}: AddressAutocompleteProps) {
  const generatedId = useId().replaceAll(":", "");
  const inputId = id ?? `address-${generatedId}`;
  const listId = `${inputId}-suggestions`;
  const statusId = `${inputId}-status`;
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [searchActive, setSearchActive] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "unavailable">("idle");
  const [retryAttempt, setRetryAttempt] = useState(0);
  const requestSequence = useRef(0);
  const sessionToken = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const suppressNextSearch = useRef(false);
  const blurTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      requestSequence.current += 1;
      if (blurTimer.current !== null) window.clearTimeout(blurTimer.current);
    },
    [],
  );

  useEffect(() => {
    const query = value.trim();
    const sequence = ++requestSequence.current;
    if (suppressNextSearch.current) {
      suppressNextSearch.current = false;
      setSuggestions([]);
      setStatus("idle");
      return;
    }
    if (!searchActive || query.length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setActiveIndex(-1);
      setStatus("idle");
      return;
    }

    const timer = window.setTimeout(() => {
      setStatus("loading");
      void loadGooglePlacesLibrary()
        .then(async (places) => {
          if (requestSequence.current !== sequence) return;
          if (!sessionToken.current) sessionToken.current = new places.AutocompleteSessionToken();
          const response = await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
            input: query,
            includedRegionCodes: ["us"],
            region: "us",
            sessionToken: sessionToken.current,
          });
          if (requestSequence.current !== sequence) return;
          setSuggestions(response.suggestions.filter((item) => item.placePrediction));
          setActiveIndex(-1);
          setStatus("ready");
        })
        .catch(() => {
          if (requestSequence.current !== sequence) return;
          setSuggestions([]);
          setActiveIndex(-1);
          setStatus("unavailable");
        });
    }, SEARCH_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [retryAttempt, searchActive, value]);

  const selectSuggestion = async (suggestion: Suggestion) => {
    const prediction = suggestion.placePrediction;
    if (!prediction) return;
    const sequence = ++requestSequence.current;
    setSuggestions([]);
    setActiveIndex(-1);
    setStatus("loading");
    try {
      const place = prediction.toPlace();
      await place.fetchFields({ fields: ["addressComponents", "formattedAddress"] });
      if (requestSequence.current !== sequence) return;
      const parsed = parseGooglePlaceAddress(place);
      suppressNextSearch.current = true;
      if (parsed && onAddressSelect) onAddressSelect(parsed);
      else onChange(place.formattedAddress || prediction.text.toString());
      sessionToken.current = null;
      setSearchActive(false);
      setStatus("idle");
    } catch {
      if (requestSequence.current !== sequence) return;
      setStatus("unavailable");
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!suggestions.length) {
      if (event.key === "Escape") setSearchActive(false);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => (current <= 0 ? suggestions.length - 1 : current - 1));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      void selectSuggestion(suggestions[activeIndex]!);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setSuggestions([]);
      setActiveIndex(-1);
      setSearchActive(false);
    }
  };

  // Layered over `Input`. The off-token variants use `focus-visible:` so
  // tailwind-merge replaces Input's accent ring rather than stacking a second one.
  const variantClass =
    variant === "public"
      ? "h-9 border-gray-700 bg-gray-800 py-0 text-white shadow-none placeholder:text-gray-500 focus:border-amber-500 focus-visible:ring-1 focus-visible:ring-amber-500"
      : variant === "vendor"
        ? "h-10 border-slate-300 bg-white py-0 text-slate-900 caret-slate-900 shadow-none placeholder:text-slate-400 focus:border-emerald-500 focus-visible:ring-1 focus-visible:ring-emerald-500"
        : "h-9 py-0";
  const optionsVisible = searchActive && suggestions.length > 0;
  const mutedClass = variant === "vendor" ? "text-slate-500" : "text-text-muted";
  const optionClass =
    variant === "public"
      ? "border-gray-700 bg-gray-900 text-white"
      : variant === "vendor"
        ? "border-slate-200 bg-white text-slate-900"
        : "border-border bg-surface-raised text-text-primary";

  return (
    <div className="relative">
      <Input
        id={inputId}
        type="text"
        value={value}
        onChange={(event) => {
          requestSequence.current += 1;
          onChange(event.target.value);
          setSearchActive(true);
        }}
        onFocus={() => setSearchActive(true)}
        onBlur={() => {
          onBlur?.();
          blurTimer.current = window.setTimeout(() => {
            setSearchActive(false);
            setSuggestions([]);
            setActiveIndex(-1);
            sessionToken.current = null;
            requestSequence.current += 1;
          }, 0);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label={ariaLabel}
        aria-autocomplete="list"
        aria-controls={listId}
        aria-describedby={status === "idle" ? undefined : statusId}
        aria-expanded={optionsVisible}
        aria-activedescendant={optionsVisible && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
        role="combobox"
        required={required}
        autoComplete={autoComplete}
        className={cn(variantClass, className)}
      />

      {optionsVisible && (
        <div
          className={cn(
            "absolute left-0 right-0 top-full z-[70] mt-1 overflow-hidden rounded-md border shadow-xl",
            optionClass,
          )}
        >
          <ul
            id={listId}
            role="listbox"
            aria-label="Address suggestions"
            className="max-h-60 overflow-y-auto py-1"
          >
            {suggestions.map((suggestion, index) => {
              const prediction = suggestion.placePrediction!;
              const text = predictionText(prediction);
              return (
                <li
                  id={`${listId}-${index}`}
                  key={prediction.placeId}
                  role="option"
                  aria-selected={activeIndex === index}
                  className={cn(
                    "cursor-pointer px-3 py-2 text-sm",
                    activeIndex === index &&
                      (variant === "vendor"
                        ? "bg-emerald-50"
                        : variant === "public"
                          ? "bg-gray-800"
                          : "bg-surface-overlay"),
                  )}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => void selectSuggestion(suggestion)}
                >
                  <span className="block font-medium">{text.main}</span>
                  {text.secondary && (
                    <span className={cn("mt-0.5 block text-xs", mutedClass)}>{text.secondary}</span>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="flex justify-end border-t px-3 py-1.5">
            {/* Google's fixed attribution asset is not served through the Next image optimizer. */}
            <img
              src="https://maps.gstatic.com/mapfiles/api-3/images/powered-by-google-on-white3.png"
              alt="Powered by Google"
              className="h-[14px] w-auto"
            />
          </div>
        </div>
      )}

      <div
        id={statusId}
        role="status"
        aria-live="polite"
        className={cn("mt-1 text-xs", mutedClass)}
      >
        {status === "loading" && "Finding addresses…"}
        {status === "ready" &&
          !suggestions.length &&
          value.trim().length >= MIN_QUERY_LENGTH &&
          "No matches. Continue entering the address manually."}
        {status === "unavailable" && (
          <span>
            Address suggestions are unavailable. Continue entering the address manually.{" "}
            <button
              type="button"
              className={cn(
                "font-medium underline underline-offset-2",
                variant === "vendor" ? "text-emerald-700" : "text-accent",
              )}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                sessionToken.current = null;
                setSearchActive(true);
                setRetryAttempt((attempt) => attempt + 1);
              }}
            >
              Retry
            </button>
          </span>
        )}
      </div>
    </div>
  );
}
