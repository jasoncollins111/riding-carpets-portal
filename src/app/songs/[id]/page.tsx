'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import axios from 'axios';

interface Song {
  id: number;
  song: string;
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

export default function SongShowsPage() {
  const params = useParams();
  const id = params.id as string;

  const [song, setSong] = useState<Song | null>(null);
  const [shows, setShows] = useState<Show[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShows = async () => {
      try {
        const response = await axios.get('/api/song-shows', { params: { id } });
        setSong(response.data?.song ?? null);
        setShows(response.data?.shows?.rows ?? []);
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
      <h1 className="text-3xl font-bold">{song.song}</h1>
      <p className="text-gray-600 mb-6 mt-1">
        {shows.length} {shows.length === 1 ? 'show' : 'shows'}
      </p>
      {!shows.length ? (
        <p className="text-gray-600">This song has not been played at any shows yet.</p>
      ) : (
        <ul className="space-y-3">
          {shows.map((show) => (
            <li
              key={show.id}
              className="p-4 border rounded-lg shadow"
            >
              <p className="text-lg font-semibold">
                {formatDate(show.date)} — {show.venue} — {show.city}
                {show.state ? `, ${show.state}` : ''}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
