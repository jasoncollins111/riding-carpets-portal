'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';

interface Song {
  id: number;
  song: string;
  show_count: number;
}

export default function SongsPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await axios.get('/api/songs');
        const rows = response.data?.songs ?? [];
        setSongs(rows);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load songs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSongs();
  }, []);

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading songs...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Songs</h1>
      <p className="text-gray-600 mb-6 mt-1">{songs.length} {songs.length === 1 ? 'song' : 'songs'}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {songs.map((song) => (
          <Link
            key={song.id}
            href={`/songs/${song.id}`}
            className="p-4 border rounded-lg shadow hover:shadow-md transition-shadow block"
          >
            <h2 className="text-xl font-semibold">{song.song}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {song.show_count} {song.show_count === 1 ? 'show' : 'shows'}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
