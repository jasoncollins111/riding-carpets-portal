import { NextResponse } from 'next/server';

export function badRequest(message: string) {
  return NextResponse.json({ message }, { status: 400 });
}

export function apiError(error: unknown, status = 500) {
  console.error(error);
  if (status === 500) {
    return NextResponse.json({ message: 'Internal server error' }, { status });
  }
  const message = error instanceof Error ? error.message : 'Request failed';
  return NextResponse.json({ message }, { status });
}
