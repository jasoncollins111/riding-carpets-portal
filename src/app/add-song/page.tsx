'use client'

import { useState } from 'react';
import { Box, FormControl } from '@mui/material';
import {
  Button,
  Input,
  Stack,
  Typography,
  Alert,
} from '@mui/joy';
import axios from 'axios';

export default function SetlistForm() {
  const [song, setSong] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitSong() {
    if (!song.trim()) return;

    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      await axios.post('/api/add-song', { song: song.trim() });
      setSong('');
      setSuccess(true);
    } catch (err) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : 'Failed to add song.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Box sx={{ height: '100vh' }}>
      <Box sx={{ m: '50px' }}>
        <Typography level="h1">Add Song</Typography>
        <FormControl>
          <Stack spacing={1} sx={{ maxWidth: 400, mt: 2 }}>
            <Input
              placeholder="Song Name"
              value={song}
              onChange={(e) => setSong(e.target.value)}
            />
            {error ? <Alert color="danger">{error}</Alert> : null}
            {success ? <Alert color="success">Song added.</Alert> : null}
            <Button onClick={submitSong} loading={isSubmitting} disabled={isSubmitting}>
              Submit Song
            </Button>
          </Stack>
        </FormControl>
      </Box>
    </Box>
  );
}
