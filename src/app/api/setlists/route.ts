import { sql } from '@/app/lib/db';
import { NextResponse } from 'next/server';
import { apiError } from '@/app/lib/api-error';

export async function GET() {
  try {
    const setlists = await sql`
      SELECT setlists.*, shows.date, shows.venue, shows.city
      FROM setlists
      JOIN shows ON setlists.show_id = shows.id
      ORDER BY shows.date DESC, setlists.song_name ASC
    `;
    return NextResponse.json({ setlists }, { status: 200 });
  } catch (error) {
    return apiError(error);
  }
}
