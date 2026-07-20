'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import StatCard from '@/app/components/stats/StatCard';
import RankedList from '@/app/components/stats/RankedList';
import { formatShortDate } from '@/app/lib/format-date';

interface Overview {
  total_shows: number;
  unique_songs_played: number;
  total_plays: number;
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

interface CurrentDrought {
  song_id: number;
  song_name: string;
  last_played_date: string;
  last_show_id: number;
  shows_since_last_played: number;
}

interface StatsData {
  overview: Overview;
  most_played: RankedSong[];
  set_openers: Record<string, RankedSong[]>;
  set_closers: Record<string, RankedSong[]>;
  longest_gaps: LongestGap[];
  current_droughts: CurrentDrought[];
}

const SET_ORDER = ['Set I', 'Set II', 'Set III', 'Set IV', 'Encore', 'Setlist'];

function orderedSetNames(
  openers: Record<string, RankedSong[]>,
  closers: Record<string, RankedSong[]>,
): string[] {
  const names = new Set([...Object.keys(openers), ...Object.keys(closers)]);
  return [...names].sort((a, b) => {
    const ai = SET_ORDER.indexOf(a);
    const bi = SET_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
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
  const setNames = orderedSetNames(stats.set_openers, stats.set_closers);

  return (
    <div className="container mx-auto px-4 py-8 text-gray-900">
      <h1 className="text-3xl font-bold">Band Stats</h1>
      <p className="text-gray-600 mb-8 mt-1">
        Setlist statistics across {overview.total_shows}{' '}
        {overview.total_shows === 1 ? 'show' : 'shows'}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        <StatCard label="Total Shows" value={overview.total_shows} />
        <StatCard label="Songs Played" value={overview.unique_songs_played} />
        <StatCard label="Total Plays" value={overview.total_plays} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <section className="p-5 border border-gray-200 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Most Played Songs</h2>
          <RankedList items={stats.most_played} countLabel="shows" />
        </section>
      </div>

      {setNames.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {setNames.flatMap((setName) => [
            <section
              key={`${setName}-openers`}
              className="p-5 border border-gray-200 rounded-lg shadow-sm"
            >
              <h2 className="text-xl font-semibold mb-4">
                Most Common {setName} Openers
              </h2>
              <p className="text-sm text-gray-500 mb-3">First song of the set</p>
              <RankedList items={stats.set_openers[setName] ?? []} countLabel="times" />
            </section>,
            <section
              key={`${setName}-closers`}
              className="p-5 border border-gray-200 rounded-lg shadow-sm"
            >
              <h2 className="text-xl font-semibold mb-4">
                Most Common {setName} Closers
              </h2>
              <p className="text-sm text-gray-500 mb-3">Last song of the set</p>
              <RankedList items={stats.set_closers[setName] ?? []} countLabel="times" />
            </section>,
          ])}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                        {formatShortDate(gap.from_date)}
                      </Link>
                      {' → '}
                      <Link
                        href={`/shows/${gap.to_show_id}`}
                        className="hover:underline"
                      >
                        {formatShortDate(gap.to_date)}
                      </Link>
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="p-5 border border-gray-200 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Longest Since Last Played</h2>
          <p className="text-sm text-gray-500 mb-4">
            Songs with the most shows since their most recent performance
          </p>
          {!stats.current_droughts.length ? (
            <p className="text-gray-500 text-sm">No drought data available.</p>
          ) : (
            <ol className="space-y-4">
              {stats.current_droughts.map((drought, index) => (
                <li
                  key={`${drought.song_id}-${drought.last_played_date}`}
                  className="flex gap-3"
                >
                  <span className="text-gray-400 text-sm w-5 text-right shrink-0 pt-0.5">
                    {index + 1}.
                  </span>
                  <div className="min-w-0">
                    <p>
                      <Link
                        href={`/songs/${drought.song_id}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {drought.song_name}
                      </Link>
                      <span className="text-gray-600">
                        {' '}
                        — {drought.shows_since_last_played}{' '}
                        {drought.shows_since_last_played === 1 ? 'show' : 'shows'}
                      </span>
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Last played{' '}
                      <Link
                        href={`/shows/${drought.last_show_id}`}
                        className="hover:underline"
                      >
                        {formatShortDate(drought.last_played_date)}
                      </Link>
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}
