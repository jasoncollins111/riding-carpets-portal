import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { apiError } from '@/app/lib/api-error';

export async function GET() {
  try {
    const shows = await sql`SELECT * FROM shows ORDER BY date DESC`;
    return NextResponse.json({ shows }, { status: 200 });
  } catch (error) {
    return apiError(error);
  }
}
