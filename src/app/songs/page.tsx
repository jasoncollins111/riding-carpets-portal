'use client'

import { useState, useEffect } from 'react';

interface Song {
  id: string;
  title: string;
  artist: string;
  // Add other song properties as needed
}

export default function SongsPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSongs = async () => {
      // try {
      //   // Replace with your actual API endpoint
      //   const response = await fetch('/api/songs');
      //   if (!response.ok) {
      //     throw new Error('Failed to fetch songs');
      //   }
      //   const data = await response.json();
      //   setSongs(data);
      // } catch (err) {
      //   setError(err instanceof Error ? err.message : 'Failed to load songs');
      // } finally {
      //   setIsLoading(false);
      // }
    };

    // fetchSongs();
  }, []);

  if (isLoading) {
    return <div>Loading songs...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Songs</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {songs.map((song) => (
          <div
            key={song.id}
            className="p-4 border rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold">{song.title}</h2>
            <p className="text-gray-600">{song.artist}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
