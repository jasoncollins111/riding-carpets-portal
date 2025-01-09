'use client'

import { useState, useEffect } from 'react';
import { Box, FormControl } from '@mui/material';
import {
  Checkbox,
  Button,
  Input,
  Sheet,
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

export default function addShow() {
  
  const [venue, setVenue] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [date, setDate] = useState<Dayjs | null>(null);
  const [songList, setSongList] = useState<Array<any>>([]);
  const [filteredSongList, setFilteredSongList] = useState<Array<any>>([]);
  const [setlist, setSetlist] = useState<Array<any>>([]);

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
    if (venue && city && state && notes && date && setlist.length > 0) {
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

  const addSet = () => {
    console.log('add set')
  }

  console.log('setlits', setlist)
  return (
    <Grid container spacing={4} sx={{ height: "100vh", width: "100vw", ml: "50px", mt: "50px", flexGrow: 1, display:"flex" }}>
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
                <Textarea minRows={6} placeholder="Notes" onChange={e => setNotes(e.target.value)}/>
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
                    const isSelected = setlist.some(setlistSong => setlistSong.song_name === item.song);
                    return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }} key={idx}>
                          <Checkbox
                            label={item.song}
                            value={item.song}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSetlist([...setlist, {
                                  song_name: item.song,
                                  minutes: 0,
                                  seconds: 0,
                                  segue: false,
                                  transition: false
                                }]);
                              } else {
                                setSetlist(setlist.filter(song => song.song_name !== item.song));
                              }
                            }}
                            checked={isSelected}
                          />
                          {isSelected && (
                          <>
                              <Input
                                size="sm"
                                type="number"
                                placeholder="Min"
                                sx={{ width: 60 }}
                                onChange={(e) => {
                                  const minutes = parseInt(e.target.value);
                                  setSetlist(setlist.map(song => {
                                    if (song.song_name === item.song) {
                                      return { ...song, minutes };
                                    }
                                    return song;
                                  }));
                                }}
                                value={setlist.find(song => song.song_name === item.song)?.minutes || 0}
                              />
                              <Input
                                size="sm" 
                                type="number"
                                placeholder="Sec"
                                sx={{ width: 60 }}
                                onChange={(e) => {
                                  const seconds = parseInt(e.target.value);
                                  setSetlist(setlist.map(song => {
                                    if (song.song_name === item.song) {
                                      return { ...song, seconds };
                                    }
                                    return song;
                                  }));
                                }}
                                value={setlist.find(song => song.song_name === item.song)?.seconds || 0}
                            />
                            <Checkbox
                              label="Segue"
                              value="segue"
                              onChange={(e) => {
                                const { checked } = e.target;
                                const setlistUpdate = setlist.reduce((list, song) => {
                                  if (song.song_name === item.song) {
                                      song = {...song, segue: checked, transition: false}
                                  }
                                  list.push(song)
                                  return list;
                                }, []);
                                setSetlist(setlistUpdate);
                              }}
                              checked={setlist.find(song=>song.song_name===item.song)?.segue}
                            />
                            <Checkbox
                              label="Transition"
                              value="transition"
                              onChange={(e) => {
                                const { checked } = e.target;
                                console.log('checked', checked)
                                const setlistUpdate = setlist.reduce((list,song) => {
                                  if (song.song_name === item.song) {
                                      song = {...song, segue: false, transition: checked}
                                  }
                                  list.push(song);
                                  return list;
                                }, []);
                                setSetlist(setlistUpdate);
                              }}
                              checked={setlist.find(song=>song.song_name === item.song)?.transition}
                            />
                            </>
                          )}
                        </Box>
                    );
                  })}
                  <Button onClick={addSet}>Add Set</Button>
                  <Button onClick={submitShow}>Submit</Button>
                </Stack>
              </FormControl>
            </Box>
          </Box>
      </Grid>
      <Grid xs={8}>
        {/* <Box sx={{ ml: '50px', justifyContent: "center" }}>
          <p>Set I:</p>
          <Sheet sx={{display:'flex'}}>
            {setlist.map((song,idx) => {
              let songTransitionSymbol = ',\u00A0';
              if (song.segue) {
                songTransitionSymbol = ' ->\u00A0';
              } else if (song.transition) {
                songTransitionSymbol = ' >\u00A0';
              } else if (idx === setlist.length - 1) {
                songTransitionSymbol = '';
              }
              return <p>{song.song_name}{songTransitionSymbol}</p>
            })}

          </Sheet>
        </Box> */}
        <SetlistCard setlist={setlist} setlistTitle="Set I:"/>
      </Grid>
    </Grid>
  )

}