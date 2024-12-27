'use client'

import { useState, useEffect, useCallback } from 'react';
import { Box, FormControl } from '@mui/material';
import {
  Checkbox,
  Button,
  Dropdown,
  Input,
  Menu,
  MenuItem,
  MenuButton,
  Stack,
  Textarea,
  Typography
} from '@mui/joy';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {Dayjs} from 'dayjs';
import axios from 'axios';
import Header from "../../components/Header";

export default function SetlistForm() {
  
  const [venue, setVenue] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [date, setDate] = useState<Dayjs | null>(null);
  const [songList, setSongList] = useState<Array<any>>([]);
  const [setlist, setSetlist] = useState<Array<any>>([]);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    getSongs();
  },[])

  async function getSongs() {
    const result = await axios.get('/api/songs');
    const songs = result?.data?.songs?.rows;
    setSongList(songs);
  }

  async function submitShow(){
    if (venue && city && state && notes && date && setlist.length > 0) {
      await axios.post("/api/add-show", { venue, city, state, notes, date });
      await axios.post('/api/add-setlist', { setlist, venue, date });
    }
  }



  const handleOpenChange = useCallback(
    (event: React.SyntheticEvent | null, isOpen: boolean) => {
      if (isOpen) {
        setMenuOpen(isOpen);
      }
    },
    [],
  );

  async function addSongToSetlist(event: any) {
    const { value } = event.target;
    setSetlist([...setlist, {song_name: value}])
  }


  return (
    <Box sx={{ height: "100vh" }}>
      <Header/>
      <Box sx={{ justifyContent: "center", flexDirection:"column" }} className="flex">
        <Typography level="h1">Add Setlist</Typography>
        <Box sx={{}}>

          <FormControl>
            <Stack spacing={1}>
            <Input placeholder="Venue" onChange={e => setVenue(e.target.value)}/> 
            <Input placeholder="City" onChange={e => setCity(e.target.value)}/>
            <Input placeholder="State" onChange={e => setState(e.target.value)}/>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker value={date} onChange={(newDate) => setDate(newDate)} />
            </LocalizationProvider>
            <Textarea minRows={6} placeholder="Notes" onChange={e => setNotes(e.target.value)}/>
            <Dropdown open={menuOpen} onOpenChange={handleOpenChange}>
                <MenuButton>
                  Songs
                </MenuButton>
              <Menu >
                {songList.map((item, idx) => {
                  return (
                    <MenuItem key={idx}>
                      <Checkbox
                        label={item.song}
                        value={item.song}
                        key={idx}
                        onChange={addSongToSetlist}
                        checked={setlist.some(setlistSong => {
                          return setlistSong.song_name == item.song;
                        })}
                      />
                    </MenuItem>
                  )
                })}
              <Button onClick={()=>setMenuOpen(false)}>Close</Button>
              </Menu>
            </Dropdown>
              <Button onClick={submitShow}>Submit</Button>
            </Stack>
          </FormControl>
        </Box>
      </Box>
    </Box>
  )

}