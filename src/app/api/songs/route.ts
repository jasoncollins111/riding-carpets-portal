import { sql } from '@/app/lib/db';
import { NextResponse } from 'next/server';
import { apiError } from '@/app/lib/api-error';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const result = await sql`
      SELECT s.id, s.song, COUNT(DISTINCT sl.show_id)::int AS show_count
      FROM songs s
      LEFT JOIN setlists sl ON sl.song_id = s.id
      GROUP BY s.id, s.song
      ORDER BY s.song ASC
    `;
    return NextResponse.json({ songs: result.rows }, { status: 200 });
  } catch (error) {
    return apiError(error);
  }
}
