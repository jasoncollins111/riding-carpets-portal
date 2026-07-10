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

    const result = await sql`SELECT * FROM shows WHERE id = ${id}`;
    if (!result.rowCount) {
      return NextResponse.json({ message: 'Show not found' }, { status: 404 });
    }

    return NextResponse.json({ show: result.rows[0] }, { status: 200 });
  } catch (error) {
    return apiError(error);
  }
}
