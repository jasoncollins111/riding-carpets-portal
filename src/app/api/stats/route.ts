import { sql } from '@/app/lib/db';
import { NextResponse } from 'next/server';
import { apiError } from '@/app/lib/api-error';

export const runtime = 'nodejs';

interface RankedRow {
  id: number;
  song: string;
  count: number;
}

function addPercent(rows: RankedRow[], total: number) {
  return rows.map((row) => ({
    ...row,
    percent:
      total > 0 ? Number(((row.count / total) * 100).toFixed(1)) : 0,
  }));
}

interface SetRankedRow extends RankedRow {
  set_name: string | null;
}

function setDisplayName(setName: string | null): string {
  return setName ?? 'Setlist';
}

function groupBySet(
  rows: SetRankedRow[],
  setTotals: Map<string | null, number>,
  limit = 10,
): Record<string, RankedRow[]> {
  const grouped: Record<string, RankedRow[]> = {};

  for (const row of rows) {
    const key = setDisplayName(row.set_name);
    if (!grouped[key]) grouped[key] = [];
    if (grouped[key].length >= limit) continue;

    const total = setTotals.get(row.set_name) ?? 0;
    grouped[key].push({
      id: row.id,
      song: row.song,
      count: row.count,
      percent: total > 0 ? Number(((row.count / total) * 100).toFixed(1)) : 0,
    });
  }

  return grouped;
}

export async function GET() {
  try {
    const [
      overviewResult,
      mostPlayedResult,
      openersResult,
      closersResult,
      setTotalsResult,
      gapsResult,
      droughtsResult,
    ] = await Promise.all([
      sql`
        SELECT
          (SELECT COUNT(*)::int FROM shows) AS total_shows,
          (SELECT COUNT(DISTINCT song_id)::int FROM setlists) AS unique_songs_played,
          (SELECT COUNT(*)::int FROM setlists) AS total_plays,
          (SELECT COUNT(*)::int FROM songs) AS catalog_size,
          (SELECT COUNT(*)::int FROM songs s WHERE NOT EXISTS (
            SELECT 1 FROM setlists sl WHERE sl.song_id = s.id
          )) AS unplayed_count,
          (
            SELECT COALESCE(AVG(song_count), 0)::numeric(10,1)
            FROM (
              SELECT show_id, COUNT(*)::int AS song_count
              FROM setlists
              GROUP BY show_id
            ) sub
          ) AS avg_setlist_length
      `,
      sql`
        SELECT s.id, s.song, COUNT(DISTINCT sl.show_id)::int AS count
        FROM songs s
        JOIN setlists sl ON s.id = sl.song_id
        GROUP BY s.id, s.song
        ORDER BY count DESC, s.song ASC
        LIMIT 10
      `,
      sql`
        WITH set_openers AS (
          SELECT sl.song_id, sl.song_name, sl.set_name
          FROM setlists sl
          JOIN (
            SELECT show_id, set_name, MIN(position) AS min_pos
            FROM setlists
            GROUP BY show_id, set_name
          ) first
            ON sl.show_id = first.show_id
           AND sl.set_name IS NOT DISTINCT FROM first.set_name
           AND sl.position = first.min_pos
        )
        SELECT set_name, song_id AS id, song_name AS song, COUNT(*)::int AS count
        FROM set_openers
        GROUP BY set_name, song_id, song_name
        ORDER BY set_name NULLS LAST, count DESC, song_name ASC
      `,
      sql`
        WITH set_closers AS (
          SELECT sl.song_id, sl.song_name, sl.set_name
          FROM setlists sl
          JOIN (
            SELECT show_id, set_name, MAX(position) AS max_pos
            FROM setlists
            GROUP BY show_id, set_name
          ) last
            ON sl.show_id = last.show_id
           AND sl.set_name IS NOT DISTINCT FROM last.set_name
           AND sl.position = last.max_pos
        )
        SELECT set_name, song_id AS id, song_name AS song, COUNT(*)::int AS count
        FROM set_closers
        GROUP BY set_name, song_id, song_name
        ORDER BY set_name NULLS LAST, count DESC, song_name ASC
      `,
      sql`
        SELECT set_name, COUNT(*)::int AS total
        FROM (
          SELECT DISTINCT show_id, set_name FROM setlists
        ) sub
        GROUP BY set_name
      `,
      sql`
        WITH distinct_plays AS (
          SELECT DISTINCT sl.song_id, sl.song_name, s.date, s.id AS show_id
          FROM setlists sl
          JOIN shows s ON sl.show_id = s.id
        ),
        ordered AS (
          SELECT
            song_id,
            song_name,
            date,
            show_id,
            LAG(date) OVER (PARTITION BY song_id ORDER BY date) AS prev_date,
            LAG(show_id) OVER (PARTITION BY song_id ORDER BY date) AS prev_show_id
          FROM distinct_plays
        ),
        gaps AS (
          SELECT
            song_id,
            song_name,
            prev_date AS from_date,
            prev_show_id AS from_show_id,
            date AS to_date,
            show_id AS to_show_id,
            (
              SELECT COUNT(*)::int FROM shows
              WHERE date > ordered.prev_date AND date < ordered.date
            ) AS shows_between
          FROM ordered
          WHERE prev_date IS NOT NULL
        )
        SELECT * FROM gaps
        ORDER BY shows_between DESC
        LIMIT 10
      `,
      sql`
        WITH last_plays AS (
          SELECT DISTINCT ON (sl.song_id)
            sl.song_id,
            sl.song_name,
            s.date AS last_played_date,
            s.id AS last_show_id
          FROM setlists sl
          JOIN shows s ON sl.show_id = s.id
          ORDER BY sl.song_id, s.date DESC
        ),
        droughts AS (
          SELECT
            song_id,
            song_name,
            last_played_date,
            last_show_id,
            (
              SELECT COUNT(*)::int FROM shows WHERE date > last_plays.last_played_date
            ) AS shows_since_last_played
          FROM last_plays
        )
        SELECT * FROM droughts
        ORDER BY shows_since_last_played DESC, song_name ASC
        LIMIT 10
      `,
    ]);

    const overview = overviewResult.rows[0] ?? {
      total_shows: 0,
      unique_songs_played: 0,
      total_plays: 0,
      catalog_size: 0,
      unplayed_count: 0,
      avg_setlist_length: 0,
    };

    const totalShows = overview.total_shows || 0;

    const setTotals = new Map<string | null, number>(
      setTotalsResult.rows.map((row) => [row.set_name as string | null, row.total as number]),
    );

    return NextResponse.json(
      {
        overview: {
          total_shows: totalShows,
          unique_songs_played: overview.unique_songs_played || 0,
          total_plays: overview.total_plays || 0,
          catalog_size: overview.catalog_size || 0,
          unplayed_count: overview.unplayed_count || 0,
          avg_setlist_length: Number(overview.avg_setlist_length) || 0,
        },
        most_played: addPercent(mostPlayedResult.rows as RankedRow[], totalShows),
        set_openers: groupBySet(openersResult.rows as SetRankedRow[], setTotals),
        set_closers: groupBySet(closersResult.rows as SetRankedRow[], setTotals),
        longest_gaps: gapsResult.rows,
        current_droughts: droughtsResult.rows,
      },
      { status: 200 },
    );
  } catch (error) {
    return apiError(error);
  }
}
