import { sql } from '@/app/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { apiError, badRequest } from '@/app/lib/api-error';
import { parseSongId } from '@/app/lib/validation';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const id = parseSongId(request.nextUrl.searchParams.get('id'));
    if (id === null) {
      return badRequest('A numeric song id is required');
    }

    const songResult = await sql`SELECT id, song FROM songs WHERE id = ${id}`;
    if (!songResult.rowCount) {
      return NextResponse.json({ message: 'Song not found' }, { status: 404 });
    }

    const showsResult = await sql`
      SELECT shows.id, shows.date, shows.venue, shows.city, shows.state
      FROM setlists
      JOIN shows ON setlists.show_id = shows.id
      WHERE setlists.song_id = ${id}
      GROUP BY shows.id, shows.date, shows.venue, shows.city, shows.state
      ORDER BY shows.date DESC
    `;

    const statsResult = await sql`
      WITH song_stats AS (
        SELECT
          COUNT(*)::int AS play_count,
          COUNT(DISTINCT sl.show_id)::int AS show_count,
          MIN(s.date) AS debut_date,
          MAX(s.date) AS last_played_date
        FROM setlists sl
        JOIN shows s ON sl.show_id = s.id
        WHERE sl.song_id = ${id}
      ),
      totals AS (
        SELECT COUNT(*)::int AS total_shows FROM shows
      )
      SELECT
        song_stats.play_count,
        song_stats.show_count,
        song_stats.debut_date,
        song_stats.last_played_date,
        totals.total_shows,
        (
          SELECT COUNT(*)::int
          FROM shows
          WHERE date >= song_stats.debut_date
        ) AS shows_since_debut,
        (
          SELECT COUNT(*)::int
          FROM shows
          WHERE date > song_stats.last_played_date
        ) AS shows_since_last_played
      FROM song_stats, totals
    `;

    const stats = statsResult.rows[0] ?? {
      play_count: 0,
      show_count: 0,
      debut_date: null,
      last_played_date: null,
      total_shows: 0,
      shows_since_debut: 0,
      shows_since_last_played: 0,
    };

    const totalShows = stats.total_shows || 0;
    const showCount = stats.show_count || 0;
    const playCount = stats.play_count || 0;
    const showsSinceDebut = stats.shows_since_debut || 0;
    const percentOfShows =
      totalShows > 0 ? Number(((showCount / totalShows) * 100).toFixed(2)) : 0;
    const avgEveryNShows =
      playCount > 0 ? Number((showsSinceDebut / playCount).toFixed(1)) : null;

    return NextResponse.json(
      {
        song: songResult.rows[0],
        shows: showsResult.rows,
        stats: {
          play_count: playCount,
          show_count: showCount,
          total_shows: totalShows,
          debut_date: stats.debut_date,
          last_played_date: stats.last_played_date,
          shows_since_debut: showsSinceDebut,
          shows_since_last_played: stats.shows_since_last_played || 0,
          percent_of_shows: percentOfShows,
          avg_every_n_shows: avgEveryNShows,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return apiError(error);
  }
}
