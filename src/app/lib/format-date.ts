export function parseDateParts(rawDate: string): { year: number; month: number; day: number } | null {
  const match = rawDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);

  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) return null;

  return { year, month, day };
}

function toLocalDate(rawDate: string): Date | null {
  const parts = parseDateParts(rawDate);
  if (!parts) return null;
  return new Date(parts.year, parts.month - 1, parts.day);
}

export function formatDate(rawDate: string): string {
  const parts = parseDateParts(rawDate);
  if (!parts) return rawDate;
  const month = String(parts.month).padStart(2, '0');
  const day = String(parts.day).padStart(2, '0');
  return `${month}/${day}/${parts.year}`;
}

export function formatLongDate(rawDate: string): string {
  const date = toLocalDate(rawDate);
  if (!date) return rawDate;
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatShortDate(rawDate: string): string {
  const date = toLocalDate(rawDate);
  if (!date) return rawDate;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
