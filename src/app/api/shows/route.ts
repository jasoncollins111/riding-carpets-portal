import { sql } from '@/app/lib/db';
import { NextResponse } from 'next/server';
import { apiError } from '@/app/lib/api-error';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const result = await sql`SELECT * FROM shows ORDER BY date DESC`;
    return NextResponse.json({ shows: result.rows }, { status: 200 });
  } catch (error) {
    return apiError(error);
  }
}
