/**
 * Breaks a label into lines of at most `maxChars` characters, on spaces, for a
 * chart tick that has a fixed width and no way to measure text before drawing
 * it. A word longer than a line is split across lines. Past `maxLines`, the
 * last line ends in an ellipsis, still within `maxChars`. Always returns at
 * least one line.
 */
export function wrapLabel(text: string, maxChars: number, maxLines: number): string[] {
  const width = Math.max(1, Math.floor(maxChars));
  const lines: string[] = [];
  let current = "";
  for (const word of text.trim().split(/\s+/).filter(Boolean)) {
    if (current && current.length + 1 + word.length <= width) {
      current = `${current} ${word}`;
      continue;
    }
    if (current) lines.push(current);
    let rest = word;
    while (rest.length > width) {
      lines.push(rest.slice(0, width));
      rest = rest.slice(width);
    }
    current = rest;
  }
  if (current) lines.push(current);
  if (!lines.length) return [""];

  const limit = Math.max(1, maxLines);
  if (lines.length <= limit) return lines;
  const kept = lines.slice(0, limit);
  const last = kept[limit - 1];
  kept[limit - 1] = `${last.length >= width ? last.slice(0, width - 1) : last}…`;
  return kept;
}

/** The most lines any of `labels` wraps to — the room an axis must reserve. */
export function wrappedLineCount(labels: string[], maxChars: number, maxLines: number): number {
  return labels.reduce((max, label) => Math.max(max, wrapLabel(label, maxChars, maxLines).length), 1);
}
