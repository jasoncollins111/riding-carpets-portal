'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import axios from 'axios';

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

function formatDate(rawDate: string) {
  const date = new Date(rawDate);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

function formatLongDate(rawDate: string) {
  return new Date(rawDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
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
    return <div className="container mx-auto px-4 py-8">Loading shows...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8">Error: {error}</div>;
  }

  if (!song) {
    return <div className="container mx-auto px-4 py-8">Song not found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/songs" className="text-blue-600 hover:underline mb-4 inline-block">
        &larr; Back to Songs
      </Link>
      <h1 className="text-3xl font-bold break-words">{song.song}</h1>
      {stats && stats.play_count > 0 ? (
        <div className="text-gray-700 space-y-2 mb-6 mt-4">
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
        <ul className="space-y-3">
          {shows.map((show) => (
            <li key={show.id}>
              <Link
                href={`/shows/${show.id}`}
                className="p-4 border rounded-lg shadow hover:shadow-md transition-shadow block"
              >
                <p className="text-lg font-semibold break-words">
                  {formatDate(show.date)} — {show.venue} — {show.city}
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
