'use client'

import { useState, useEffect } from 'react';
import { Box, FormControl } from '@mui/material';
import {
  Checkbox,
  Button,
  Input,
  Link,
  Stack,
  Textarea,
  Typography,
  Grid
} from '@mui/joy';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {Dayjs} from 'dayjs';
import axios from 'axios';
import SetlistCard from '../components/SetlistCard';
import AddSongModal from '../components/AddSongModal';

export default function AddShow() {
  
  const [venue, setVenue] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [date, setDate] = useState<Dayjs | null>(null);
  const [songList, setSongList] = useState<Array<any>>([]);
  const [filteredSongList, setFilteredSongList] = useState<Array<any>>([]);
  const [setlist, setSetlist] = useState<Record<string, any[]>>({ "Set One": [], "Set Two": [], "Set Three": [], "Encore": [] });
  const [currentList, setCurrentList] = useState<string>('Set One');
  const [openSongModal, setOpenSongModal] = useState<boolean>(false);
  const [song, setSong] = useState<string>('');

  useEffect(() => {
    getSongs();
  },[])

  async function getSongs() {
    const result = await axios.get('/api/songs');
    const songs = result?.data?.songs?.rows;
    setSongList(songs);
    setFilteredSongList(songs);
  }

  async function submitShow() {
    console.log(setlist);
    if (venue && city && state && notes && date && setlist.length) {
      // await axios.post("/api/add-show", { venue, city, state, notes, date });
      // await axios.post('/api/add-setlist', { setlist, venue, date });
    }
  }


  const searchSongs = (term: string) => {
    const filteredSongs = songList.filter(item => {
      if (!term || term.length < 3) return songList;
      return item.song.toLowerCase().includes(term.toLowerCase());
    });
    setFilteredSongList(filteredSongs);
  }
  const addPoster = () => {
    console.log('add poster');
  }

  const addSong = (song: string) => {
    setOpenSongModal(true);
    setSong(song);
    // setSetlist({
    //   ...setlist,
    //   [currentList]: [...setlist[currentList], {
    //     song_name: song,
    //     minutes: 0,
    //     seconds: 0,
    //     segue: false,
    //     transition: false
    //   }]
    // });
  }
  console.log('setlist', setlist)
  return (
    <Grid container spacing={4} sx={{ height: "100vh", width: "100vw", ml: "50px", mt: "50px", flexGrow: 1, display:"flex" }}>
      {openSongModal ?
        <AddSongModal
          handleOpen={setOpenSongModal}
          isOpen={openSongModal}
          song={song}
          setlist={setlist}
          title={currentList}
          setSetlist={setSetlist}
        /> : null
      }
      <Grid xs={4}>
        <Box sx={{ justifyContent: "center", flexDirection:"column" }} className="flex">
          <Typography level="h1">Add Show</Typography>
          <Box>
            <FormControl>
              <Stack spacing={1}>
              <Input placeholder="Venue" onChange={e => setVenue(e.target.value)}/> 
              <Input placeholder="City" onChange={e => setCity(e.target.value)}/>
              <Input placeholder="State" onChange={e => setState(e.target.value)}/>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker value={date} onChange={(newDate) => setDate(newDate)} />
              </LocalizationProvider>
              <Textarea minRows={6} placeholder="Notes" onChange={e => setNotes(e.target.value)} />
              <Box>
                {Object.keys(setlist).map((key) => {
                    return (
                      <Checkbox 
                        key={key}
                        onClick={() => setCurrentList(key)}
                        checked={key === currentList}
                        value={key}
                        label={key}
                      />
                    );
                })}
              </Box>
              <Input
                placeholder="Search songs..."
                    onChange={(e) => {
                      e.preventDefault(); 
                      setSearchTerm(e.target.value);
                      searchSongs(e.target.value);
                    }}
                    sx={{ mb: 1 }}
                value={searchTerm}
              />
              {filteredSongList.map((item, idx) => {
                return (
                  <Link onClick={()=>addSong(item.song)} key={idx}>{item.song}</Link>
                )
              })}
              <Button onClick={addPoster}>Add Poster</Button>
              <Button onClick={submitShow}>Submit</Button>
            </Stack>
          </FormControl>
        </Box>
      </Box>
      </Grid>
      <Grid xs={8}>
        {Object.keys(setlist).map(key => {
          return setlist[key].length > 0 && (
            <SetlistCard key={key} setlist={setlist[key]} setlistTitle={key} />
          );
        })}
      </Grid>
    </Grid>
  )

}