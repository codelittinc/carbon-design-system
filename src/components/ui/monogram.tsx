import type { ReactElement } from "react";
import { cn } from "@/lib/cn";

const sizeClasses = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-12 text-base",
} as const;

interface MonogramProps {
  /** What the tile stands for. The initials are derived from it. */
  name: string;
  /** Letters to show instead of the derived ones. Uppercased. */
  initials?: string;
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
 * A tile with one or two letters, for something that has no logo of its own,
 * such as a third-party tool ("GS" for Google Suite, "SL" for Slack).
 *
 * Not the same as `ProductMark`, which is a Carbon app's own mark (a solid
 * accent square with one initial, plus the app's name). A monogram is a muted
 * tile that stands in for someone else's logo, beside a name the page already
 * shows. It is decorative and hidden from screen readers, so put the name in
 * visible text or in the surrounding link's label.
 */
export function Monogram({ name, initials, size = "md", className }: MonogramProps): ReactElement {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center rounded-md bg-accent-muted font-semibold text-accent-text",
        sizeClasses[size],
        className,
      )}
    >
      {(initials ?? deriveInitials(name)).toUpperCase()}
    </span>
  );
}
