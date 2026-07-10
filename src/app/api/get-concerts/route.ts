import { sql } from '@/app/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { apiError } from '@/app/lib/api-error';

export async function GET(request: NextRequest) {
  try {
    const year = request.nextUrl.searchParams.get('year');

    const shows = year
      ? await sql`
          SELECT * FROM shows
          WHERE EXTRACT(YEAR FROM date) = ${parseInt(year, 10)}
          ORDER BY date DESC
        `
      : await sql`SELECT * FROM shows ORDER BY date DESC`;

    return NextResponse.json({ shows }, { status: 200 });
  } catch (error) {
    return apiError(error);
  }
}
