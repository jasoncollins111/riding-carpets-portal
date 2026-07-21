import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import RecentSetlists from './RecentSetlists.jsx';

vi.mock('axios');

describe('RecentSetlists', () => {
  beforeEach(() => {
    vi.mocked(axios.get).mockReset();
  });

  it('shows loading state initially', () => {
    vi.mocked(axios.get).mockReturnValue(new Promise(() => {}));
    render(<RecentSetlists />);
    expect(screen.getByText('Loading concerts...')).toBeInTheDocument();
  });

  it('renders concerts and setlists after fetch', async () => {
    vi.mocked(axios.get)
      .mockResolvedValueOnce({
        data: {
          shows: [{ id: 1, venue: 'Red Rocks', city: 'Morrison', state: 'CO', date: '2024-06-01' }],
        },
      })
      .mockResolvedValueOnce({
        data: {
          rows: [{ song_id: 10, song_name: 'Terrapin', position: 1, set_name: 'Set I' }],
        },
      });

    render(<RecentSetlists />);

    await waitFor(() => {
      expect(screen.getByText(/Red Rocks/)).toBeInTheDocument();
      expect(screen.getByText(/Terrapin/)).toBeInTheDocument();
    });

    expect(axios.get).toHaveBeenCalledWith('/api/get-concerts', {
      params: { limit: 10 },
    });
  });

  it('shows empty state when no concerts exist', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: { shows: [] },
    });

    render(<RecentSetlists />);

    await waitFor(() => {
      expect(screen.getByText('No concerts found.')).toBeInTheDocument();
    });
  });
});
