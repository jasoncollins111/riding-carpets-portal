import React from 'react';
import { Box, Typography } from '@mui/joy';

function parseNoteLines(notes) {
  if (!notes || typeof notes !== 'string') return [];
  return notes
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export function ShowNotes({ notes, sx = {} }) {
  const lines = parseNoteLines(notes);
  if (!lines.length) return null;

  return (
    <Box sx={{ mt: 2, ...sx }}>
      <Typography level="body-sm" sx={{ fontWeight: 600 }}>
        Notes:
      </Typography>
      {lines.map((line, index) => (
        <Typography key={`${index}-${line}`} level="body-sm" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>
          {line}
        </Typography>
      ))}
    </Box>
  );
}
