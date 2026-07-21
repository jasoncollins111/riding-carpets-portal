'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { formatDate } from '@/app/lib/format-date';

export interface SongOccurrence {
  show_id: number;
  show_date: string;
  show_venue: string;
  show_city: string;
  show_state: string | null;
  position: number;
  set_name: string | null;
  set_number: number | null;
  minutes: number | null;
  seconds: number | null;
  footnote_refs: string | null;
  footnote_text: string | null;
  show_gap: number | null;
  song_before_id: number | null;
  song_before_name: string | null;
  song_after_id: number | null;
  song_after_name: string | null;
}

type SortKey =
  | 'show_date'
  | 'show_gap'
  | 'set_number'
  | 'track_time'
  | 'song_before_name'
  | 'song_after_name'
  | 'footnote_text';

type SortDirection = 'asc' | 'desc';

function formatSetLabel(setName: string | null, setNumber: number | null) {
  if (setName === 'Encore') return 'E';
  if (setNumber !== null) return String(setNumber);
  return '—';
}

function formatTrackTime(minutes: number | null, seconds: number | null) {
  if (minutes == null || seconds == null) return '—';
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function trackTimeSortValue(minutes: number | null, seconds: number | null) {
  if (minutes == null || seconds == null) return -1;
  return minutes * 60 + seconds;
}

function compareStrings(a: string | null, b: string | null) {
  const left = a ?? '';
  const right = b ?? '';
  return left.localeCompare(right, undefined, { sensitivity: 'base' });
}

function compareNumbers(a: number | null, b: number | null) {
  const left = a ?? Number.NEGATIVE_INFINITY;
  const right = b ?? Number.NEGATIVE_INFINITY;
  return left - right;
}

function getSortValue(occurrence: SongOccurrence, key: SortKey) {
  switch (key) {
    case 'show_date':
      return occurrence.show_date;
    case 'show_gap':
      return occurrence.show_gap;
    case 'set_number':
      return occurrence.set_name === 'Encore' ? 99 : occurrence.set_number;
    case 'track_time':
      return trackTimeSortValue(occurrence.minutes, occurrence.seconds);
    case 'song_before_name':
      return occurrence.song_before_name;
    case 'song_after_name':
      return occurrence.song_after_name;
    case 'footnote_text':
      return occurrence.footnote_text;
  }
}

function compareOccurrences(a: SongOccurrence, b: SongOccurrence, key: SortKey, direction: SortDirection) {
  const multiplier = direction === 'asc' ? 1 : -1;

  if (key === 'show_date') {
    return multiplier * a.show_date.localeCompare(b.show_date);
  }

  if (key === 'song_before_name' || key === 'song_after_name' || key === 'footnote_text') {
    return multiplier * compareStrings(getSortValue(a, key) as string | null, getSortValue(b, key) as string | null);
  }

  return multiplier * compareNumbers(getSortValue(a, key) as number | null, getSortValue(b, key) as number | null);
}

function SongLink({ songId, songName }: { songId: number | null; songName: string | null }) {
  if (!songName) return <>—</>;
  if (!songId) return <>{songName}</>;

  return (
    <Link href={`/songs/${songId}`} className="link-rc">
      {songName}
    </Link>
  );
}

const columns: { key: SortKey; label: string; align?: 'right' }[] = [
  { key: 'show_date', label: 'Show' },
  { key: 'show_gap', label: 'Show Gap', align: 'right' },
  { key: 'set_number', label: 'Set', align: 'right' },
  { key: 'track_time', label: 'Track Time', align: 'right' },
  { key: 'song_before_name', label: 'Song Before' },
  { key: 'song_after_name', label: 'Song After' },
  { key: 'footnote_text', label: 'Footnote' },
];

export default function OccurrenceTable({ occurrences }: { occurrences: SongOccurrence[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('show_date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const sortedOccurrences = useMemo(() => {
    return [...occurrences].sort((a, b) => {
      const primary = compareOccurrences(a, b, sortKey, sortDirection);
      if (primary !== 0) return primary;
      return compareOccurrences(a, b, 'show_date', 'desc');
    });
  }, [occurrences, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((direction) => (direction === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(key);
    setSortDirection(key === 'show_date' ? 'desc' : 'asc');
  };

  const sortIndicator = (key: SortKey) => {
    if (sortKey !== key) return '↕';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
      <table className="min-w-full text-sm text-gray-900">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`px-3 py-3 font-semibold whitespace-nowrap ${
                  column.align === 'right' ? 'text-right' : 'text-left'
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleSort(column.key)}
                  className="inline-flex items-center gap-1 hover:text-rc-teal"
                >
                  <span>{column.label}</span>
                  <span className="text-xs text-gray-400">{sortIndicator(column.key)}</span>
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedOccurrences.map((occurrence) => (
            <tr
              key={`${occurrence.show_id}-${occurrence.position}`}
              className="border-b border-gray-200 last:border-b-0"
            >
              <td className="px-3 py-3 whitespace-nowrap">
                <Link href={`/shows/${occurrence.show_id}`} className="link-rc">
                  {formatDate(occurrence.show_date)}
                </Link>
                <div className="text-xs text-gray-500 mt-0.5 max-w-[12rem] truncate" title={occurrence.show_venue}>
                  {occurrence.show_venue}
                </div>
              </td>
              <td className="px-3 py-3 text-right tabular-nums">
                {occurrence.show_gap === null ? '—' : occurrence.show_gap}
              </td>
              <td className="px-3 py-3 text-right tabular-nums">
                {formatSetLabel(occurrence.set_name, occurrence.set_number)}
              </td>
              <td className="px-3 py-3 text-right tabular-nums whitespace-nowrap">
                {formatTrackTime(occurrence.minutes, occurrence.seconds)}
              </td>
              <td className="px-3 py-3">
                {occurrence.song_before_name ? (
                  <SongLink songId={occurrence.song_before_id} songName={occurrence.song_before_name} />
                ) : (
                  '***'
                )}
              </td>
              <td className="px-3 py-3">
                {occurrence.song_after_name ? (
                  <SongLink songId={occurrence.song_after_id} songName={occurrence.song_after_name} />
                ) : (
                  '***'
                )}
              </td>
              <td className="px-3 py-3">{occurrence.footnote_text ?? ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
