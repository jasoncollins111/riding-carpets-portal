import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { apiError, badRequest } from '@/app/lib/api-error';
import { isNonEmptyString } from '@/app/lib/validation';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { song } = body;

    if (!isNonEmptyString(song)) {
      return badRequest('song name is required');
    }

    await sql`INSERT INTO songs (song) VALUES (${song.trim()})`;

    const songs = await sql`SELECT * FROM songs ORDER BY song ASC`;
    return NextResponse.json({ songs }, { status: 200 });
  } catch (error) {
    return apiError(error);
  }
}
