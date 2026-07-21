'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box } from '@mui/material';
import {
  Select,
  Option,
  Sheet,
  Typography,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  AccordionGroup,
} from '@mui/joy';
import axios from 'axios';
import SetlistCard from './SetlistCard';
import { ShowNotes } from './ShowNotes';
import { formatDate } from '@/app/lib/format-date';

const YEARS = ['2025', '2024', '2023', '2022', '2021', '2020'];

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
        const params = year ? { year } : {};
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

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <CircularProgress size="sm" />
        <Typography>Loading concerts...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert color="danger">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          mb: 2,
        }}
      >
        <Typography level="h2">Concerts</Typography>
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
        <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
          {showCount} show{showCount !== 1 ? 's' : ''}
        </Typography>
      </Box>

      {!concertList.length ? (
        <Typography level="body-md">No concerts for this year.</Typography>
      ) : (
        <AccordionGroup
          sx={{
            '& .MuiAccordion-root': {
              bgcolor: 'var(--rc-cream)',
              backgroundColor: 'var(--rc-cream)',
            },
          }}
        >
          {concertList.map(({ concert, setlist }) => {
            const setGroups = groupBySetName(setlist);
            return (
              <Accordion
                key={concert.id}
                sx={{
                  bgcolor: 'var(--rc-cream)',
                  backgroundColor: 'var(--rc-cream)',
                }}
              >
                <AccordionSummary sx={{ bgcolor: 'var(--rc-cream)' }}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography level="title-md">{formatDate(concert.date)}</Typography>
                    <Typography level="body-md" sx={{ color: 'text.secondary', wordBreak: 'break-word' }}>
                      {concert.venue} — {concert.city}
                      {concert.state ? `, ${concert.state}` : ''}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ bgcolor: 'var(--rc-cream)' }}>
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
                </AccordionDetails>
              </Accordion>
            );
          })}
        </AccordionGroup>
      )}
    </Box>
  );
}
