import { sql } from '@/app/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { apiError } from '@/app/lib/api-error';

export const runtime = 'nodejs';

function parseLimit(value: string | null): number | null {
  if (!value) return null;
  const limit = parseInt(value, 10);
  if (!Number.isFinite(limit) || limit < 1) return null;
  return limit;
}

export async function GET(request: NextRequest) {
  try {
    const year = request.nextUrl.searchParams.get('year');
    const limit = parseLimit(request.nextUrl.searchParams.get('limit'));

    if (request.nextUrl.searchParams.get('limit') && limit === null) {
      return NextResponse.json({ error: 'Invalid limit' }, { status: 400 });
    }

    const result = year
      ? limit
        ? await sql`
            SELECT * FROM shows
            WHERE EXTRACT(YEAR FROM date) = ${parseInt(year, 10)}
            ORDER BY date DESC
            LIMIT ${limit}
          `
        : await sql`
            SELECT * FROM shows
            WHERE EXTRACT(YEAR FROM date) = ${parseInt(year, 10)}
            ORDER BY date DESC
          `
      : limit
        ? await sql`
            SELECT * FROM shows
            ORDER BY date DESC
            LIMIT ${limit}
          `
        : await sql`SELECT * FROM shows ORDER BY date DESC`;

    return NextResponse.json({ shows: result.rows }, { status: 200 });
  } catch (error) {
    return apiError(error);
  }
}
