import { sql } from '@vercel/postgres';
import { NextRequest, NextResponse } from 'next/server';
import { apiError, badRequest } from '@/app/lib/api-error';
import { isNonEmptyString } from '@/app/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const song = request.nextUrl.searchParams.get('song');
    if (!isNonEmptyString(song)) {
      return badRequest('song query parameter is required');
    }

    const history = await sql`
      SELECT shows.date, shows.venue, shows.city, shows.state, setlists.song_name
      FROM setlists
      JOIN shows ON setlists.show_id = shows.id
      WHERE setlists.song_name = ${song}
      ORDER BY shows.date DESC
    `;

    return NextResponse.json({ history: history.rows }, { status: 200 });
  } catch (error) {
    return apiError(error);
  }
}
