"use client";

import { useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/cn";

let loadPromise: Promise<void> | null = null;

/**
 * Resolve the Google Maps API key from the host environment. Supports Vite
 * (VITE_GOOGLE_MAPS_API_KEY) and Next.js (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) so the
 * same component works in this Storybook and in the app. Access is guarded so it
 * never throws when neither `import.meta.env` nor `process` is present.
 */
function getApiKey(): string | undefined {
  const viteEnv = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
  const nodeEnv = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
  return viteEnv?.VITE_GOOGLE_MAPS_API_KEY ?? nodeEnv?.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
}

function loadGoogleMaps(): Promise<void> {
  if (loadPromise) return loadPromise;
  const key = getApiKey();
  if (!key || typeof window === "undefined") return Promise.resolve();
  if (window.google?.maps?.places) return Promise.resolve();

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });
  return loadPromise;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  variant?: "staff" | "public";
}

export function AddressAutocomplete({ value, onChange, onBlur, placeholder = "Start typing an address...", className, variant = "staff" }: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const handlePlaceSelect = useCallback(() => {
    const place = autocompleteRef.current?.getPlace();
    if (place?.formatted_address) {
      onChange(place.formatted_address);
    }
  }, [onChange]);

  useEffect(() => {
    let mounted = true;
    loadGoogleMaps().then(() => {
      if (!mounted || !inputRef.current || !window.google?.maps?.places) return;
      if (autocompleteRef.current) return;

      const ac = new google.maps.places.Autocomplete(inputRef.current, {
        types: ["address"],
        componentRestrictions: { country: "us" },
        fields: ["formatted_address"],
      });
      ac.addListener("place_changed", handlePlaceSelect);
      autocompleteRef.current = ac;
    });
    return () => { mounted = false; };
  }, [handlePlaceSelect]);

  const baseClass = variant === "public"
    ? "flex h-9 w-full rounded-md border border-gray-700 bg-gray-800 px-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:border-amber-500 focus:ring-amber-500"
    : "flex h-8 w-full rounded-md border border-border bg-surface-raised px-3 py-1 text-sm text-text-primary shadow-sm transition-colors placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50";

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      placeholder={placeholder}
      className={cn(baseClass, className)}
    />
  );
}
