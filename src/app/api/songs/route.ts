import { sql } from '@/app/lib/db';
import { NextResponse } from 'next/server';
import { apiError } from '@/app/lib/api-error';

export async function GET() {
  try {
    const songs = await sql`SELECT * FROM songs ORDER BY song ASC`;
    return NextResponse.json({ songs }, { status: 200 });
  } catch (error) {
    return apiError(error);
  }
}
