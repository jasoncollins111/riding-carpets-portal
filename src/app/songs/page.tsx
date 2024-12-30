'use client'

import { useState, useEffect } from 'react';
import axios from 'axios';
interface Song {
  id: string;
  song: string;
}

export default function SongsPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await axios.get('/api/songs');
        if (response.statusText !== 'OK') {
          throw new Error('Failed to fetch songs');
        }
        const {data} = await response;
        console.log(data);
        const songs = data.songs.rows;
        setSongs(songs);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load songs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSongs();
  }, []);

  if (isLoading) {
    // return <div>Loading songs yooooo...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Songs yooooo</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {songs.map((song) => (
          <div
            key={song.id}
            className="p-4 border rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold">{song.song}</h2>
            {/* <p className="text-gray-600">{song.artist}</p> */}
          </div>
        ))}
      </div>
    </div>
  );
}
