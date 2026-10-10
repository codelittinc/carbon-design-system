"use client";

import { useState, type ReactElement } from "react";
import { cn } from "@/lib/cn";

const sizeClasses = {
  xs: "size-5 text-[0.625rem]",
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-12 text-base",
} as const;

interface MonogramProps {
  /** What the tile stands for. The initials are derived from it. */
  name: string;
  /** Letters to show instead of the derived ones. Uppercased. */
  initials?: string;
  /**
   * The thing's own logo. Drawn to fill the tile, cropped to it. While it is
   * missing, or when it fails to load, the tile shows the letters instead, so
   * a broken link never leaves a broken-image icon.
   */
  src?: string | null;
  size?: keyof typeof sizeClasses;
  className?: string;
}

/**
 * First letter of each of the first two words, or the first two letters of a
 * single word, ignoring anything that is not a letter or digit. `Array.from`
 * splits by code point, so a letter outside the BMP stays whole.
 */
function deriveInitials(name: string): string {
  const words = name
    .split(/\s+/)
    .map((word) => Array.from(word.replace(/[^\p{L}\p{N}]/gu, "")))
    .filter((letters) => letters.length > 0);
  const [first, second] = words;
  if (!first) return "";
  const letters = second ? [first[0], second[0]] : first.slice(0, 2);
  return letters.join("");
}

/**
 * A tile for something that is not a Carbon app, such as a third-party tool:
 * its logo when `src` is given, otherwise one or two letters ("GS" for Google
 * Suite, "SL" for Slack).
 *
 * Not the same as `ProductMark`, which is a Carbon app's own mark (a solid
 * accent square with one initial, plus the app's name). A monogram is a muted
 * tile that stands in for someone else's logo, beside a name the page already
 * shows. It is decorative and hidden from screen readers, so put the name in
 * visible text or in the surrounding link's label.
 */
export function Monogram({
  name,
  initials,
  src,
  size = "md",
  className,
}: MonogramProps): ReactElement {
  // The src that failed, not a flag: a new src gets its own chance to load.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const image = src && src !== failedSrc ? src : null;

  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-md font-semibold",
        image
          ? "border border-border bg-surface"
          : "bg-accent-muted text-accent-text",
        sizeClasses[size],
        className,
      )}
    >
      {image ? (
        <img
          src={image}
          alt=""
          onError={() => setFailedSrc(image)}
          className="size-full object-cover"
        />
      ) : (
        (initials ?? deriveInitials(name)).toUpperCase()
      )}
    </span>
  );
}
