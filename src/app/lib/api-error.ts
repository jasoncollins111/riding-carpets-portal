import { NextResponse } from 'next/server';

export function badRequest(message: string) {
  return NextResponse.json({ message }, { status: 400 });
}

export function apiError(error: unknown, status = 500) {
  console.error(error);
  const isDev = process.env.NODE_ENV === 'development';
  const message =
    error instanceof Error ? error.message : 'Request failed';

  if (status === 500 && !isDev) {
    return NextResponse.json({ message: 'Internal server error' }, { status });
  }

  return NextResponse.json({ message }, { status });
}
