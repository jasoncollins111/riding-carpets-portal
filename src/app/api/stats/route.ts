import { sql } from '@/app/lib/db';
import { NextResponse } from 'next/server';
import { apiError } from '@/app/lib/api-error';

export const runtime = 'nodejs';

interface RankedRow {
  id: number;
  song: string;
  count: number;
}

function addPercent(rows: RankedRow[], totalShows: number) {
  return rows.map((row) => ({
    ...row,
    percent:
      totalShows > 0
        ? Number(((row.count / totalShows) * 100).toFixed(1))
        : 0,
  }));
}

export async function GET() {
  try {
    const [
      overviewResult,
      mostPlayedResult,
      rarestResult,
      openersResult,
      closersResult,
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
        SELECT s.id, s.song, COUNT(DISTINCT sl.show_id)::int AS count
        FROM songs s
        JOIN setlists sl ON s.id = sl.song_id
        GROUP BY s.id, s.song
        ORDER BY count ASC, s.song ASC
        LIMIT 10
      `,
      sql`
        WITH show_openers AS (
          SELECT sl.song_id, sl.song_name
          FROM setlists sl
          JOIN (
            SELECT show_id, MIN(position) AS min_pos
            FROM setlists
            GROUP BY show_id
          ) first ON sl.show_id = first.show_id AND sl.position = first.min_pos
        )
        SELECT song_id AS id, song_name AS song, COUNT(*)::int AS count
        FROM show_openers
        GROUP BY song_id, song_name
        ORDER BY count DESC, song_name ASC
        LIMIT 10
      `,
      sql`
        WITH show_closers AS (
          SELECT sl.song_id, sl.song_name
          FROM setlists sl
          JOIN (
            SELECT show_id, MAX(position) AS max_pos
            FROM setlists
            GROUP BY show_id
          ) last ON sl.show_id = last.show_id AND sl.position = last.max_pos
        )
        SELECT song_id AS id, song_name AS song, COUNT(*)::int AS count
        FROM show_closers
        GROUP BY song_id, song_name
        ORDER BY count DESC, song_name ASC
        LIMIT 10
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
        rarest: addPercent(rarestResult.rows as RankedRow[], totalShows),
        openers: addPercent(openersResult.rows as RankedRow[], totalShows),
        closers: addPercent(closersResult.rows as RankedRow[], totalShows),
        longest_gaps: gapsResult.rows,
        current_droughts: droughtsResult.rows,
      },
      { status: 200 },
    );
  } catch (error) {
    return apiError(error);
  }
}
