import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

const mockSql = vi.fn();

vi.mock('@/app/lib/db', () => ({
  sql: (...args: unknown[]) => mockSql(...args),
}));

describe('GET /api/song-occurrences', () => {
  beforeEach(() => {
    mockSql.mockReset();
  });

  it('returns occurrences for a valid song id', async () => {
    mockSql
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1, song: 'Terrapin' }] })
      .mockResolvedValueOnce({
        rows: [
          {
            show_id: 10,
            show_date: '2024-01-15',
            show_venue: 'Venue',
            show_city: 'City',
            show_state: 'ST',
            show_notes: '1. Beatles\n2. Grateful Dead',
            position: 5,
            set_name: 'Set I',
            set_number: 1,
            minutes: 19,
            seconds: 44,
            footnote_refs: '1',
            show_gap: 6,
            song_before_id: 2,
            song_before_name: 'Scarlet',
            song_after_id: 3,
            song_after_name: 'Fire',
          },
          {
            show_id: 11,
            show_date: '2024-01-01',
            show_venue: 'Venue B',
            show_city: 'City',
            show_state: 'ST',
            show_notes: null,
            position: 3,
            set_name: null,
            set_number: null,
            minutes: null,
            seconds: null,
            footnote_refs: null,
            show_gap: 0,
            song_before_id: 4,
            song_before_name: 'Sandworm',
            song_after_id: null,
            song_after_name: null,
          },
        ],
      });

    const request = new NextRequest('http://localhost/api/song-occurrences?id=1');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.song.song).toBe('Terrapin');
    expect(data.occurrences).toHaveLength(2);
    expect(data.occurrences[0].show_gap).toBe(6);
    expect(data.occurrences[0].footnote_text).toBe('Beatles');
    expect(data.occurrences[0].show_notes).toBeUndefined();
    expect(data.occurrences[1].song_after_name).toBeNull();
  });

  it('returns null song_after when next song is in a different set', async () => {
    mockSql
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1, song: 'Scarlet' }] })
      .mockResolvedValueOnce({
        rows: [
          {
            show_id: 10,
            show_date: '2024-01-15',
            show_venue: 'Venue',
            show_city: 'City',
            show_state: 'ST',
            show_notes: null,
            position: 2,
            set_name: 'Set I',
            set_number: 1,
            minutes: null,
            seconds: null,
            footnote_refs: null,
            show_gap: null,
            song_before_id: 5,
            song_before_name: 'Opener',
            song_after_id: null,
            song_after_name: null,
          },
        ],
      });

    const request = new NextRequest('http://localhost/api/song-occurrences?id=1');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.occurrences[0].song_after_name).toBeNull();
    expect(data.occurrences[0].song_after_id).toBeNull();
  });

  it('returns 404 when song is not found', async () => {
    mockSql.mockResolvedValueOnce({ rowCount: 0, rows: [] });

    const request = new NextRequest('http://localhost/api/song-occurrences?id=999');
    const response = await GET(request);

    expect(response.status).toBe(404);
  });

  it('returns 400 for invalid id', async () => {
    const request = new NextRequest('http://localhost/api/song-occurrences?id=abc');
    const response = await GET(request);
    expect(response.status).toBe(400);
  });
});
