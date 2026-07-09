const SET_HEADER_REGEX = /^Set\s*(I{1,3}|IV|1|2|3|4)\s*:?\s*$/i;
const ENCORE_HEADER_REGEX = /^(E:|Encore)\s*:?\s*$/i;

function normalizeSetName(line) {
  const trimmed = line.trim();
  if (ENCORE_HEADER_REGEX.test(trimmed)) return 'Encore';
  const match = trimmed.match(/^Set\s*(I{1,3}|IV|1|2|3|4)\s*:?\s*$/i);
  if (!match) return trimmed;
  const token = match[1].toUpperCase();
  const roman = { I: 'Set I', II: 'Set II', III: 'Set III', IV: 'Set IV', '1': 'Set I', '2': 'Set II', '3': 'Set III', '4': 'Set IV' };
  return roman[token] || `Set ${token}`;
}

function parseSheetDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const trimmed = dateStr.trim();
  const parts = trimmed.split('/');
  if (parts.length !== 3) return null;
  const month = parseInt(parts[0], 10);
  const day = parseInt(parts[1], 10);
  let year = parseInt(parts[2], 10);
  if (Number.isNaN(month) || Number.isNaN(day) || Number.isNaN(year)) return null;
  if (year < 100) year += 2000;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function parseGvizDate(cell) {
  if (!cell) return null;
  if (typeof cell === 'string') return parseSheetDate(cell);
  if (cell.f) return parseSheetDate(cell.f);
  if (cell.v && typeof cell.v === 'string' && cell.v.startsWith('Date(')) {
    const match = cell.v.match(/Date\((\d+),(\d+),(\d+)\)/);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) + 1;
      const day = parseInt(match[3], 10);
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }
  return null;
}

function splitCityState(cityStr) {
  if (!cityStr || typeof cityStr !== 'string') return { city: '', state: '' };
  const trimmed = cityStr.trim();
  const lastComma = trimmed.lastIndexOf(',');
  if (lastComma === -1) return { city: trimmed, state: '' };
  return {
    city: trimmed.slice(0, lastComma).trim(),
    state: trimmed.slice(lastComma + 1).trim(),
  };
}

function parseSetlistText(text) {
  if (!text || typeof text !== 'string' || !text.trim()) return [];

  const lines = text.split('\n');
  let currentSetName = null;
  let position = 0;
  const songs = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (SET_HEADER_REGEX.test(line)) {
      currentSetName = normalizeSetName(line);
      continue;
    }
    if (ENCORE_HEADER_REGEX.test(line)) {
      currentSetName = 'Encore';
      continue;
    }

    let working = line;
    const segue = /(?:-->|->|>)\s*$/.test(working);

    const footnoteMatches = [...working.matchAll(/\[(\d+)\]/g)];
    const footnote_refs = footnoteMatches.map((m) => m[1]).join(',') || null;

    let minutes = null;
    let seconds = null;
    const timingMatch = working.match(/ - (\d+):(\d+)/);
    if (timingMatch) {
      minutes = parseInt(timingMatch[1], 10);
      seconds = parseInt(timingMatch[2], 10);
    }

    let songName = working
      .replace(/ - \d+:\d+.*$/, '')
      .replace(/\[\d+\]/g, '')
      .replace(/(?:-->|->|>)\s*$/g, '')
      .trim();

    if (!songName) continue;

    position += 1;
    songs.push({
      position,
      set_name: currentSetName,
      song_name: songName,
      segue,
      minutes,
      seconds,
      footnote_refs,
    });
  }

  return songs;
}

function cellValue(cell) {
  if (cell == null) return '';
  if (typeof cell === 'string' || typeof cell === 'number') return String(cell);
  if (cell.v != null && cell.v !== '') return String(cell.v);
  if (cell.f) return String(cell.f);
  return '';
}

module.exports = {
  parseSetlistText,
  parseSheetDate,
  parseGvizDate,
  splitCityState,
  normalizeSetName,
  cellValue,
};
