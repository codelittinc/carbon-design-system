/**
 * Breaks a label into lines of at most `maxChars` characters, on spaces, for a
 * chart tick that has a fixed width and no way to measure text before drawing
 * it. Past `maxLines`, the last line ends in an ellipsis; so does a single word
 * longer than a line. Always returns at least one line.
 */
export function wrapLabel(text: string, maxChars: number, maxLines: number): string[] {
  const width = Math.max(1, Math.floor(maxChars));
  const fit = (word: string) => (word.length > width ? `${word.slice(0, Math.max(1, width - 1))}…` : word);
  const lines: string[] = [];
  let current = "";
  for (const word of text.trim().split(/\s+/).filter(Boolean)) {
    if (!current) current = word;
    else if (current.length + 1 + word.length <= width) current = `${current} ${word}`;
    else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  if (!lines.length) return [""];

  const kept = lines.slice(0, Math.max(1, maxLines)).map(fit);
  if (lines.length > kept.length) {
    const last = kept[kept.length - 1];
    kept[kept.length - 1] = last.endsWith("…")
      ? last
      : `${last.length >= width ? last.slice(0, Math.max(1, width - 1)) : last}…`;
  }
  return kept;
}
