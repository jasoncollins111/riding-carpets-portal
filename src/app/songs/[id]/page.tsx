'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { formatDate, formatLongDate } from '@/app/lib/format-date';

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

interface Show {
  id: number;
  date: string;
  venue: string;
  city: string;
  state: string | null;
}

function formatNumber(value: number) {
  return value.toLocaleString('en-US');
}

export default function SongShowsPage() {
  const params = useParams();
  const id = params.id as string;

  const [song, setSong] = useState<Song | null>(null);
  const [shows, setShows] = useState<Show[]>([]);
  const [stats, setStats] = useState<SongStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShows = async () => {
      try {
        const response = await axios.get('/api/song-shows', { params: { id } });
        setSong(response.data?.song ?? null);
        setShows(response.data?.shows ?? []);
        setStats(response.data?.stats ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load shows');
      } finally {
        setIsLoading(false);
      }
    };

    fetchShows();
  }, [id]);

  if (isLoading) {
    return <div className="w-full max-w-3xl mx-auto px-4 py-8 text-gray-900">Loading shows...</div>;
  }

  if (error) {
    return <div className="w-full max-w-3xl mx-auto px-4 py-8 text-gray-900">Error: {error}</div>;
  }

  if (!song) {
    return <div className="w-full max-w-3xl mx-auto px-4 py-8 text-gray-900">Song not found.</div>;
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 text-gray-900">
      <Link href="/songs" className="text-blue-600 hover:underline mb-4 inline-block min-h-11 leading-[44px]">
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
            <>
              <p>
                &ldquo;{song.song}&rdquo; has been played approximately once every{' '}
                {stats.avg_every_n_shows} shows.
              </p>
              <p>
                Since its debut, &ldquo;{song.song}&rdquo; has been played, on average, once every{' '}
                {stats.avg_every_n_shows} shows.
              </p>
            </>
          )}
          <p>
            It was played {formatNumber(stats.play_count)}{' '}
            {stats.play_count === 1 ? 'time' : 'times'} at the following{' '}
            {stats.show_count === 1 ? 'show' : 'shows'}:
          </p>
        </div>
      ) : (
        <p className="text-gray-600 mb-6 mt-1">This song has not been played at any shows yet.</p>
      )}
      {!shows.length ? null : (
        <ul className="space-y-3 w-full min-w-0">
          {shows.map((show) => (
            <li key={show.id} className="w-full min-w-0">
              <Link
                href={`/shows/${show.id}`}
                className="w-full min-w-0 p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md active:bg-gray-50 transition-shadow block text-gray-900"
              >
                <p className="text-base sm:text-lg font-semibold">{formatDate(show.date)}</p>
                <p className="text-sm sm:text-base text-gray-700 break-words mt-0.5">{show.venue}</p>
                <p className="text-sm text-gray-500 break-words">
                  {show.city}
                  {show.state ? `, ${show.state}` : ''}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
