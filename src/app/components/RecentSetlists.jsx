'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box } from '@mui/material';
import {
  Select,
  Option,
  Stack,
  Typography,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/joy';
import axios from 'axios';
import SetlistCard from './SetlistCard';
import { ShowNotes } from './ShowNotes';
import { formatDate } from '@/app/lib/format-date';

const YEARS = ['2025', '2024', '2023', '2022', '2021', '2020'];
const SHOW_LIMIT = 10;

function groupBySetName(songs) {
  const groups = [];
  let current = null;

  for (const song of songs) {
    const setName = song.set_name || 'Setlist';
    if (!current || current.title !== setName) {
      current = { title: setName, songs: [] };
      groups.push(current);
    }
    current.songs.push(song);
  }

  return groups;
}

export default function RecentSetlists() {
  const [concertList, setConcertList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [year, setYear] = useState('');

  const getSetlists = useCallback(async (latestConcerts) => {
    if (!latestConcerts?.length) {
      setConcertList([]);
      return;
    }

    const concertMap = await Promise.all(
      latestConcerts.map(async (concert) => {
        const { id } = concert;
        try {
          const setlist = await axios.get('/api/get-setlist', { params: { id } });
          const songs = setlist?.data?.rows ?? [];
          return { concert, setlist: songs };
        } catch {
          return { concert, setlist: [] };
        }
      }),
    );
    setConcertList(concertMap);
  }, []);

  useEffect(() => {
    async function getConcerts() {
      setIsLoading(true);
      setError(null);
      try {
        const params = { limit: SHOW_LIMIT };
        if (year) params.year = year;
        const result = await axios.get('/api/get-concerts', { params });
        const concerts = result?.data?.shows ?? [];
        await getSetlists(concerts);
      } catch {
        setError('Failed to load concerts.');
        setConcertList([]);
      } finally {
        setIsLoading(false);
      }
    }

    getConcerts();
  }, [getSetlists, year]);

  const showCount = useMemo(() => concertList.length, [concertList]);

  const header = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2,
        mb: 3,
      }}
    >
      <Typography level="h1">Setlists</Typography>
      <Select
        value={year}
        onChange={(_, val) => setYear(val || '')}
        placeholder="All years"
        sx={{ minWidth: 140 }}
      >
        <Option value="">All years</Option>
        {YEARS.map((y) => (
          <Option key={y} value={y}>
            {y}
          </Option>
        ))}
      </Select>
      {!isLoading && !error ? (
        <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
          {showCount} show{showCount !== 1 ? 's' : ''}
        </Typography>
      ) : null}
    </Box>
  );

  if (isLoading) {
    return (
      <Box sx={{ textAlign: 'left' }}>
        {header}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CircularProgress size="sm" />
          <Typography>Loading concerts...</Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'left' }}>
        {header}
        <Alert color="danger">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ textAlign: 'left' }}>
      {header}

      {!concertList.length ? (
        <Typography level="body-md">
          {year ? 'No concerts for this year.' : 'No concerts found.'}
        </Typography>
      ) : (
        <Stack spacing={3} sx={{ textAlign: 'left', alignItems: 'stretch' }}>
          {concertList.map(({ concert, setlist }, index) => {
            const setGroups = groupBySetName(setlist);
            return (
              <Box key={concert.id}>
                <Typography level="title-md">{formatDate(concert.date)}</Typography>
                <Typography
                  level="body-md"
                  sx={{ color: 'text.secondary', wordBreak: 'break-word', mb: 1.5 }}
                >
                  {concert.venue} — {concert.city}
                  {concert.state ? `, ${concert.state}` : ''}
                </Typography>
                {setGroups.map((group) => (
                  <SetlistCard
                    key={`${concert.id}-${group.title}`}
                    setlist={group.songs}
                    setlistTitle={group.title}
                  />
                ))}
                {!setlist.length ? (
                  <Typography level="body-sm">No setlist recorded.</Typography>
                ) : null}
                <ShowNotes notes={concert.notes} />
                {index < concertList.length - 1 ? <Divider sx={{ mt: 3 }} /> : null}
              </Box>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
