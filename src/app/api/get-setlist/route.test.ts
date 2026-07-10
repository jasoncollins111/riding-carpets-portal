import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

const mockSql = vi.fn();

vi.mock('@/app/lib/db', () => ({
  sql: (...args: unknown[]) => mockSql(...args),
}));

describe('GET /api/get-setlist', () => {
  beforeEach(() => {
    mockSql.mockReset();
  });

  it('returns songs ordered by position', async () => {
    mockSql.mockResolvedValueOnce({
      rows: [
        { position: 1, song_name: 'Terrapin', segue: false },
        { position: 2, song_name: 'Scarlet', segue: true },
      ],
    });

    const request = new NextRequest('http://localhost/api/get-setlist?id=1');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.response.rows[0].song_name).toBe('Terrapin');
    expect(data.response.rows[1].segue).toBe(true);
  });

  it('returns 400 for invalid id', async () => {
    const request = new NextRequest('http://localhost/api/get-setlist?id=abc');
    const response = await GET(request);
    expect(response.status).toBe(400);
  });
});
