import { sql, getConnectionDiagnostics } from '@/app/lib/db';
import { NextResponse } from 'next/server';
import { apiError } from '@/app/lib/api-error';

export const runtime = 'nodejs';

export async function GET() {
  const diagnostics = getConnectionDiagnostics();

  try {
    const result = await sql`SELECT 1 AS ok`;
    return NextResponse.json(
      {
        status: 'ok',
        db: result.rows[0],
        ...diagnostics,
      },
      { status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    return NextResponse.json(
      {
        status: 'error',
        message,
        ...diagnostics,
      },
      { status: 500 },
    );
  }
}
