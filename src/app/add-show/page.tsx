'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, FormControl } from '@mui/material';
import {
  Checkbox,
  Button,
  Input,
  Link,
  Stack,
  Textarea,
  Typography,
  Grid,
  Alert,
} from '@mui/joy';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { Dayjs } from 'dayjs';
import axios from 'axios';
import SetlistCard from '../components/SetlistCard';
import AddSongModal from '../components/AddSongModal';
import { hasSetlistSongs } from '@/app/lib/validation';

interface SongRow {
  id: number;
  song: string;
}

export default function AddShow() {
  const router = useRouter();
  const [venue, setVenue] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [date, setDate] = useState<Dayjs | null>(null);
  const [songList, setSongList] = useState<SongRow[]>([]);
  const [filteredSongList, setFilteredSongList] = useState<SongRow[]>([]);
  const [setlist, setSetlist] = useState<Record<string, Array<{ song_name: string }>>>({
    'Set One': [],
    'Set Two': [],
    'Set Three': [],
    Encore: [],
  });
  const [currentList, setCurrentList] = useState<string>('Set One');
  const [openSongModal, setOpenSongModal] = useState<boolean>(false);
  const [song, setSong] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    getSongs();
  }, []);

  async function getSongs() {
    const result = await axios.get('/api/songs');
    const songs = result?.data?.songs ?? [];
    setSongList(songs);
    setFilteredSongList(songs);
  }

  async function submitShow() {
    setSubmitError(null);

    if (!venue || !city || !state || !date || !hasSetlistSongs(setlist)) {
      setSubmitError('Please fill in venue, city, state, date, and add at least one song.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedDate = date.format('YYYY-MM-DD');
      await axios.post('/api/add-show', {
        venue,
        city,
        state,
        notes: notes || '',
        date: formattedDate,
      });

      const flattenedSetlist = Object.values(setlist).flat();
      await axios.post('/api/add-setlist', {
        setlist: flattenedSetlist,
        venue,
        date: formattedDate,
      });

      router.push('/');
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : 'Failed to save show. Please try again.';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const searchSongs = (term: string) => {
    if (!term || term.length < 3) {
      setFilteredSongList(songList);
      return;
    }
    const filtered = songList.filter((item) =>
      item.song.toLowerCase().includes(term.toLowerCase()),
    );
    setFilteredSongList(filtered);
  };

  const addSong = (songName: string) => {
    setOpenSongModal(true);
    setSong(songName);
  };

  return (
    <Box
      sx={{
        px: { xs: 2, sm: 3, md: 6 },
        py: { xs: 2, md: 4 },
        maxWidth: 1200,
        mx: 'auto',
      }}
    >
      {openSongModal ? (
        <AddSongModal
          handleOpen={setOpenSongModal}
          isOpen={openSongModal}
          song={song}
          setlist={setlist}
          title={currentList}
          setSetlist={setSetlist}
        />
      ) : null}
      <Grid container spacing={{ xs: 2, md: 4 }}>
        <Grid xs={12} md={4}>
          <Box sx={{ justifyContent: 'center', flexDirection: 'column' }} className="flex">
            <Typography level="h1">Add Show</Typography>
            <Box>
              <FormControl sx={{ width: '100%' }}>
                <Stack spacing={1}>
                  <Input placeholder="Venue" value={venue} onChange={(e) => setVenue(e.target.value)} />
                  <Input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
                  <Input placeholder="State" value={state} onChange={(e) => setState(e.target.value)} />
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker value={date} onChange={(newDate) => setDate(newDate)} />
                  </LocalizationProvider>
                  <Textarea minRows={6} placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {Object.keys(setlist).map((key) => (
                      <Checkbox
                        key={key}
                        onClick={() => setCurrentList(key)}
                        checked={key === currentList}
                        value={key}
                        label={key}
                      />
                    ))}
                  </Box>
                  <Input
                    placeholder="Search songs..."
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      searchSongs(e.target.value);
                    }}
                    sx={{ mb: 1 }}
                    value={searchTerm}
                  />
                  <Box sx={{ maxHeight: 240, overflowY: 'auto' }}>
                    {filteredSongList?.map((item) => (
                      <Link
                        onClick={() => addSong(item.song)}
                        key={item.id}
                        sx={{ display: 'block', py: 1.25, minHeight: 44 }}
                      >
                        {item.song}
                      </Link>
                    ))}
                  </Box>
                  {submitError ? <Alert color="danger">{submitError}</Alert> : null}
                  <Button onClick={submitShow} loading={isSubmitting} disabled={isSubmitting}>
                    Submit
                  </Button>
                </Stack>
              </FormControl>
            </Box>
          </Box>
        </Grid>
        <Grid xs={12} md={8}>
          {Object.keys(setlist).map((key) =>
            setlist[key].length > 0 ? (
              <SetlistCard key={key} setlist={setlist[key]} setlistTitle={key} />
            ) : null,
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
