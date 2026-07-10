import { sql } from '@/app/lib/db';
import { NextResponse, NextRequest } from 'next/server';
import { apiError, badRequest } from '@/app/lib/api-error';
import { parseShowId } from '@/app/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const idParam = request.nextUrl.searchParams.get('id');
    const id = parseShowId(idParam);
    if (id === null) {
      return badRequest('A numeric show id is required');
    }

    const response = await sql`
      SELECT * FROM setlists WHERE show_id = ${id} ORDER BY position ASC
    `;
    return NextResponse.json({ response }, { status: 200 });
  } catch (error) {
    return apiError(error);
  }
}
