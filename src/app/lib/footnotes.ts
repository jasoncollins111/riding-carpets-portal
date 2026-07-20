export function parseShowFootnotes(notes: string | null | undefined): Record<string, string> {
  if (!notes) return {};

  const map: Record<string, string> = {};
  for (const line of notes.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const match = trimmed.match(/^(\d+)\.\s*(.+)$/);
    if (match) {
      map[match[1]] = match[2].trim();
    }
  }

  return map;
}

export function resolveFootnoteText(
  footnoteRefs: string | null | undefined,
  notes: string | null | undefined,
): string | null {
  if (!footnoteRefs) return null;

  const footnotes = parseShowFootnotes(notes);
  const texts = footnoteRefs
    .split(',')
    .map((ref) => ref.trim())
    .filter(Boolean)
    .map((ref) => footnotes[ref])
    .filter(Boolean);

  return texts.length ? texts.join('; ') : null;
}
