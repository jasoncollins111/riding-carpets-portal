'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import StatCard from '@/app/components/stats/StatCard';
import RankedList from '@/app/components/stats/RankedList';

interface Overview {
  total_shows: number;
  unique_songs_played: number;
  total_plays: number;
  catalog_size: number;
  unplayed_count: number;
  avg_setlist_length: number;
}

interface RankedSong {
  id: number;
  song: string;
  count: number;
  percent?: number;
}

interface LongestGap {
  song_id: number;
  song_name: string;
  shows_between: number;
  from_date: string;
  from_show_id: number;
  to_date: string;
  to_show_id: number;
}

interface StatsData {
  overview: Overview;
  most_played: RankedSong[];
  rarest: RankedSong[];
  openers: RankedSong[];
  closers: RankedSong[];
  longest_gaps: LongestGap[];
}

function formatDate(rawDate: string) {
  return new Date(rawDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/stats');
        setStats(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stats');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-gray-900">Loading stats...</div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-gray-900">Error: {error}</div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto px-4 py-8 text-gray-900">No stats available.</div>
    );
  }

  const { overview } = stats;

  return (
    <div className="container mx-auto px-4 py-8 text-gray-900">
      <h1 className="text-3xl font-bold">Band Stats</h1>
      <p className="text-gray-600 mb-8 mt-1">
        Setlist statistics across {overview.total_shows}{' '}
        {overview.total_shows === 1 ? 'show' : 'shows'}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        <StatCard label="Total Shows" value={overview.total_shows} />
        <StatCard label="Songs Played" value={overview.unique_songs_played} />
        <StatCard label="Total Plays" value={overview.total_plays} />
        <StatCard
          label="Avg Setlist Length"
          value={overview.avg_setlist_length}
          detail="songs per show"
        />
        <StatCard label="Song Catalog" value={overview.catalog_size} />
        <StatCard
          label="Never Played"
          value={overview.unplayed_count}
          detail="in catalog"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <section className="p-5 border border-gray-200 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Most Played Songs</h2>
          <RankedList items={stats.most_played} countLabel="shows" />
        </section>

        <section className="p-5 border border-gray-200 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Rarest Songs</h2>
          <RankedList items={stats.rarest} countLabel="shows" />
        </section>

        <section className="p-5 border border-gray-200 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Most Common Show Openers</h2>
          <p className="text-sm text-gray-500 mb-3">First song of the night</p>
          <RankedList items={stats.openers} countLabel="times" />
        </section>

        <section className="p-5 border border-gray-200 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Most Common Show Closers</h2>
          <p className="text-sm text-gray-500 mb-3">Last song of the night</p>
          <RankedList items={stats.closers} countLabel="times" />
        </section>
      </div>

      <section className="p-5 border border-gray-200 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Longest Gaps Between Plays</h2>
        <p className="text-sm text-gray-500 mb-4">
          Shows that passed between consecutive performances of the same song
        </p>
        {!stats.longest_gaps.length ? (
          <p className="text-gray-500 text-sm">No gap data available.</p>
        ) : (
          <ol className="space-y-4">
            {stats.longest_gaps.map((gap, index) => (
              <li key={`${gap.song_id}-${gap.from_date}-${gap.to_date}`} className="flex gap-3">
                <span className="text-gray-400 text-sm w-5 text-right shrink-0 pt-0.5">
                  {index + 1}.
                </span>
                <div className="min-w-0">
                  <p>
                    <Link
                      href={`/songs/${gap.song_id}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {gap.song_name}
                    </Link>
                    <span className="text-gray-600">
                      {' '}
                      — {gap.shows_between}{' '}
                      {gap.shows_between === 1 ? 'show' : 'shows'}
                    </span>
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    <Link
                      href={`/shows/${gap.from_show_id}`}
                      className="hover:underline"
                    >
                      {formatDate(gap.from_date)}
                    </Link>
                    {' → '}
                    <Link
                      href={`/shows/${gap.to_show_id}`}
                      className="hover:underline"
                    >
                      {formatDate(gap.to_date)}
                    </Link>
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
