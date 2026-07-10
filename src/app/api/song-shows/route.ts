import { sql } from '@/app/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { apiError, badRequest } from '@/app/lib/api-error';
import { parseSongId } from '@/app/lib/validation';

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

    const shows = await sql`
      SELECT shows.id, shows.date, shows.venue, shows.city, shows.state
      FROM setlists
      JOIN shows ON setlists.show_id = shows.id
      WHERE setlists.song_id = ${id}
      GROUP BY shows.id, shows.date, shows.venue, shows.city, shows.state
      ORDER BY shows.date DESC
    `;

    return NextResponse.json({ song: songResult.rows[0], shows }, { status: 200 });
  } catch (error) {
    return apiError(error);
  }
}
