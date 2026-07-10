import { sql } from '@/app/lib/db';
import { NextResponse } from 'next/server';
import { apiError, badRequest } from '@/app/lib/api-error';
import { isNonEmptyString } from '@/app/lib/validation';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { venue, city, state, notes, date } = body;

    if (!isNonEmptyString(date) || !isNonEmptyString(venue) || !isNonEmptyString(city) || !isNonEmptyString(state)) {
      return badRequest('date, venue, city, and state are required');
    }

    await sql`
      INSERT INTO shows (date, venue, city, state, notes)
      VALUES (${date}, ${venue}, ${city}, ${state}, ${notes ?? ''})
    `;

    const result = await sql`SELECT * FROM shows ORDER BY date DESC`;
    return NextResponse.json({ shows: result.rows }, { status: 200 });
  } catch (error) {
    return apiError(error);
  }
}
