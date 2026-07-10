import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

const mockSql = vi.fn();

vi.mock('@/app/lib/db', () => ({
  sql: (...args: unknown[]) => mockSql(...args),
}));

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/add-setlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/add-setlist', () => {
  beforeEach(() => {
    mockSql.mockReset();
  });

  it('returns 400 when setlist is missing', async () => {
    const response = await POST(
      makeRequest({ date: '2024-06-01', venue: 'Red Rocks' }),
    );
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      message: 'setlist must be a non-empty array of items with song_name',
    });
  });

  it('returns 400 when date or venue is missing', async () => {
    const response = await POST(
      makeRequest({ setlist: [{ song_name: 'Terrapin' }] }),
    );
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      message: 'date and venue are required',
    });
  });

  it('returns 400 when show is not found', async () => {
    mockSql.mockResolvedValueOnce({ rowCount: 0, rows: [] });

    const response = await POST(
      makeRequest({
        setlist: [{ song_name: 'Terrapin' }],
        date: '2024-06-01',
        venue: 'Red Rocks',
      }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      message: 'Show not found for the given date and venue',
    });
  });

  it('inserts all songs before responding', async () => {
    mockSql
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1 }] })
      .mockResolvedValueOnce({ rowCount: 0 })
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 10 }] })
      .mockResolvedValueOnce({ rowCount: 1 })
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 11 }] })
      .mockResolvedValueOnce({ rowCount: 1 })
      .mockResolvedValueOnce({
        rows: [
          { show_id: 1, song_id: 10, song_name: 'Terrapin', position: 1 },
          { show_id: 1, song_id: 11, song_name: 'Scarlet', position: 2 },
        ],
      });

    const response = await POST(
      makeRequest({
        setlist: [{ song_name: 'Terrapin' }, { song_name: 'Scarlet' }],
        date: '2024-06-01',
        venue: 'Red Rocks',
      }),
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.show_id).toBe(1);
    expect(data.inserted).toBe(2);
    expect(data.setlist).toHaveLength(2);
    expect(mockSql).toHaveBeenCalledTimes(7);
  });
});
