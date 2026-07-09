export function parseShowId(id: string | null): number | null {
  if (!id) return null;
  const parsed = parseInt(id, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

export function hasSetlistSongs(setlist: Record<string, unknown[]>): boolean {
  return Object.values(setlist).some((songs) => songs.length > 0);
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export interface SetlistItem {
  song_name: string;
}

export function validateSetlistItems(setlist: unknown): SetlistItem[] | null {
  if (!Array.isArray(setlist) || setlist.length === 0) return null;
  for (const item of setlist) {
    if (!item || typeof item !== 'object' || !isNonEmptyString((item as SetlistItem).song_name)) {
      return null;
    }
  }
  return setlist as SetlistItem[];
}
