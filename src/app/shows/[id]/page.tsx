'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import axios from 'axios';
import SetlistCard from '../../components/SetlistCard';
import { ShowNotes } from '../../components/ShowNotes';
import { formatDate } from '@/app/lib/format-date';

interface Show {
  id: number;
  date: string;
  venue: string;
  city: string;
  state: string | null;
  notes: string | null;
  amount_earned: number | null;
}

interface SetlistSong {
  song_id?: number;
  song_name: string;
  set_name: string | null;
  segue: boolean | null;
  transition: boolean | null;
  minutes: number | null;
  seconds: number | null;
  footnote_refs: string | null;
}

function groupBySetName(songs: SetlistSong[]) {
  const groups: { title: string; songs: SetlistSong[] }[] = [];
  let current: { title: string; songs: SetlistSong[] } | null = null;

  for (const song of songs) {
    const setName = song.set_name || 'Setlist';
    if (!current || current.title !== setName) {
      current = { title: setName, songs: [] };
      groups.push(current);
    }
    current.songs.push(song);
  }

  return groups;
}

export default function ShowPage() {
  const params = useParams();
  const id = params.id as string;

  const [show, setShow] = useState<Show | null>(null);
  const [setlist, setSetlist] = useState<SetlistSong[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShow = async () => {
      try {
        const [showResponse, setlistResponse] = await Promise.all([
          axios.get('/api/get-show', { params: { id } }),
          axios.get('/api/get-setlist', { params: { id } }),
        ]);
        setShow(showResponse.data?.show ?? null);
        setSetlist(setlistResponse.data?.rows ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load show');
      } finally {
        setIsLoading(false);
      }
    };

    fetchShow();
  }, [id]);

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading show...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8">Error: {error}</div>;
  }

  if (!show) {
    return <div className="container mx-auto px-4 py-8">Show not found.</div>;
  }

  const setGroups = groupBySetName(setlist);

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/" className="link-rc mb-4 inline-block">
        &larr; Back to Setlists
      </Link>
      <h1 className="text-3xl font-bold break-words">
        {formatDate(show.date)} — {show.venue}
      </h1>
      <p className="text-gray-600 mb-6 mt-1 break-words">
        {show.city}
        {show.state ? `, ${show.state}` : ''}
      </p>

      {!setlist.length ? (
        <p className="text-gray-600">No setlist recorded.</p>
      ) : (
        <div className="mt-4">
          {setGroups.map((group) => (
            <SetlistCard
              key={`${show.id}-${group.title}`}
              setlist={group.songs}
              setlistTitle={group.title}
            />
          ))}
        </div>
      )}

      <ShowNotes notes={show.notes} />
    </div>
  );
}
