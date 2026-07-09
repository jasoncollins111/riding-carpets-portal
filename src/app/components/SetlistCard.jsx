import React from 'react';
import { Box } from '@mui/material';
import { Sheet, Typography } from '@mui/joy';

export default function SetlistCard({ setlist, setlistTitle }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography level="title-sm" sx={{ mb: 0.5 }}>
        {setlistTitle}
      </Typography>
      <Sheet sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {setlist.map((song, idx) => {
          let songTransitionSymbol = ',\u00A0';
          if (song.segue) {
            songTransitionSymbol = ' ->\u00A0';
          } else if (song.transition) {
            songTransitionSymbol = ' >\u00A0';
          } else if (idx === setlist.length - 1) {
            songTransitionSymbol = '';
          }

          const footnote = song.footnote_refs ? `[${song.footnote_refs}]` : '';
          const timing =
            song.minutes != null && song.seconds != null
              ? ` (${song.minutes}:${String(song.seconds).padStart(2, '0')})`
              : '';

          return (
            <Typography key={`${song.song_name}-${idx}`} level="body-sm" component="span">
              {song.song_name}
              {footnote}
              {timing}
              {songTransitionSymbol}
            </Typography>
          );
        })}
      </Sheet>
    </Box>
  );
}
