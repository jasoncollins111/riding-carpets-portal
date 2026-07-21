'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { formatLongDate } from '@/app/lib/format-date';
import OccurrenceTable, { type SongOccurrence } from '@/app/components/songs/OccurrenceTable';

interface Song {
  id: number;
  song: string;
}

interface SongStats {
  play_count: number;
  show_count: number;
  total_shows: number;
  debut_date: string | null;
  last_played_date: string | null;
  shows_since_debut: number;
  shows_since_last_played: number;
  percent_of_shows: number;
  avg_every_n_shows: number | null;
}

function formatNumber(value: number) {
  return value.toLocaleString('en-US');
}

export default function SongShowsPage() {
  const params = useParams();
  const id = params.id as string;

  const [song, setSong] = useState<Song | null>(null);
  const [occurrences, setOccurrences] = useState<SongOccurrence[]>([]);
  const [stats, setStats] = useState<SongStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSongData = async () => {
      try {
        const [showsResponse, occurrencesResponse] = await Promise.all([
          axios.get('/api/song-shows', { params: { id } }),
          axios.get('/api/song-occurrences', { params: { id } }),
        ]);
        setSong(showsResponse.data?.song ?? occurrencesResponse.data?.song ?? null);
        setStats(showsResponse.data?.stats ?? null);
        setOccurrences(occurrencesResponse.data?.occurrences ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load song data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSongData();
  }, [id]);

  if (isLoading) {
    return <div className="w-full max-w-6xl mx-auto px-4 py-8 text-gray-900">Loading shows...</div>;
  }

  if (error) {
    return <div className="w-full max-w-6xl mx-auto px-4 py-8 text-gray-900">Error: {error}</div>;
  }

  if (!song) {
    return <div className="w-full max-w-6xl mx-auto px-4 py-8 text-gray-900">Song not found.</div>;
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 text-gray-900">
      <Link href="/songs" className="link-rc mb-4 inline-block min-h-11 leading-[44px]">
        &larr; Back to Songs
      </Link>
      <h1 className="text-2xl sm:text-3xl font-bold break-words">{song.song}</h1>
      {stats && stats.play_count > 0 ? (
        <div className="text-gray-700 space-y-2 mb-6 mt-4 text-base">
          <p>
            {song.song} was played at {stats.percent_of_shows}% of live shows.
          </p>
          {stats.last_played_date && (
            <p>
              It was last played {formatLongDate(stats.last_played_date)}, which was{' '}
              {stats.shows_since_last_played}{' '}
              {stats.shows_since_last_played === 1 ? 'show' : 'shows'} ago.
            </p>
          )}
          <p>
            There have been {formatNumber(stats.shows_since_debut)} shows since the live debut.
          </p>
          {stats.avg_every_n_shows !== null && (
            <p>
              Since its debut, &ldquo;{song.song}&rdquo; has been played, on average, once every{' '}
              {stats.avg_every_n_shows} shows.
            </p>
          )}
          <p>
            It was played {formatNumber(stats.play_count)}{' '}
            {stats.play_count === 1 ? 'time' : 'times'}:
          </p>
        </div>
      ) : (
        <p className="text-gray-600 mb-6 mt-1">This song has not been played at any shows yet.</p>
      )}
      {occurrences.length > 0 && <OccurrenceTable occurrences={occurrences} />}
    </div>
  );
}
