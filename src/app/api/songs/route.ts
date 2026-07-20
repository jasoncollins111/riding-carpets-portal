import { sql } from '@/app/lib/db';
import { NextResponse } from 'next/server';
import { apiError } from '@/app/lib/api-error';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const result = await sql`
      WITH last_plays AS (
        SELECT DISTINCT ON (sl.song_id)
          sl.song_id,
          s.date AS last_played_date
        FROM setlists sl
        JOIN shows s ON sl.show_id = s.id
        ORDER BY sl.song_id, s.date DESC
      ),
      shows_after AS (
        SELECT lp.song_id, COUNT(s.date)::int AS shows_since_last_played
        FROM last_plays lp
        LEFT JOIN shows s ON s.date > lp.last_played_date
        GROUP BY lp.song_id
      )
      SELECT
        s.id,
        s.song,
        COUNT(DISTINCT sl.show_id)::int AS show_count,
        sa.shows_since_last_played
      FROM songs s
      LEFT JOIN setlists sl ON sl.song_id = s.id
      LEFT JOIN shows_after sa ON sa.song_id = s.id
      GROUP BY s.id, s.song, sa.shows_since_last_played
      ORDER BY s.song ASC
    `;
    return NextResponse.json({ songs: result.rows }, { status: 200 });
  } catch (error) {
    return apiError(error);
  }
}
