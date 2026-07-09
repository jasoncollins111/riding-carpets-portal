import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { apiError, badRequest } from '@/app/lib/api-error';
import { isNonEmptyString, validateSetlistItems } from '@/app/lib/validation';

interface SetlistInput {
  song_name: string;
  set_name?: string;
  segue?: boolean;
  minutes?: number;
  seconds?: number;
  footnote_refs?: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { setlist, date, venue } = body;

    const items = validateSetlistItems(setlist);
    if (!items) {
      return badRequest('setlist must be a non-empty array of items with song_name');
    }
    if (!isNonEmptyString(date) || !isNonEmptyString(venue)) {
      return badRequest('date and venue are required');
    }

    const showResult = await sql`SELECT id FROM shows WHERE date = ${date} AND venue = ${venue}`;
    if (!showResult.rowCount) {
      return badRequest('Show not found for the given date and venue');
    }
    const show_id = showResult.rows[0].id as number;

    await sql`DELETE FROM setlists WHERE show_id = ${show_id}`;

    let inserted = 0;
    for (let i = 0; i < items.length; i++) {
      const item = items[i] as SetlistInput;
      const position = i + 1;
      const songResult = await sql`SELECT id FROM songs WHERE song = ${item.song_name}`;
      if (!songResult.rowCount) {
        return badRequest(`Song not found: ${item.song_name}`);
      }
      const song_id = songResult.rows[0].id as number;
      await sql`
        INSERT INTO setlists (show_id, song_id, song_name, position, set_name, segue, minutes, seconds, footnote_refs)
        VALUES (
          ${show_id}, ${song_id}, ${item.song_name}, ${position},
          ${item.set_name ?? null}, ${item.segue ?? false},
          ${item.minutes ?? null}, ${item.seconds ?? null}, ${item.footnote_refs ?? null}
        )
      `;
      inserted++;
    }

    const entries = await sql`
      SELECT * FROM setlists WHERE show_id = ${show_id} ORDER BY position ASC
    `;
    return NextResponse.json(
      { show_id, inserted, setlist: entries.rows },
      { status: 200 },
    );
  } catch (error) {
    return apiError(error);
  }
}
