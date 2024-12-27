'use client'

import { useState } from 'react';
import { Box, FormControl } from '@mui/material';
import {
  Button,
  Input,
  Stack,
  Textarea,
  Typography,

} from '@mui/joy';
import axios from 'axios';
import Header from "../../components/Header";


export default function SetlistForm() {
  
  const [song, setSong] = useState<string>('');
  const [lyrics, setLyrics] = useState<string>('');

  async function submitSong() {
    if (song) {
      try {
        await axios.post("/api/add-song", { song });
        setSong('');
      } catch (error) {
        console.log('error', error);
      }
    }
  }

  

  return (
    <Box sx={{ height: "100vh" }}>
      <Header />
      <Box sx={{m:"50px"}}>
        <Typography level="h1">Add Song</Typography>
        <FormControl>
          <Stack spacing={1}>
            <Input placeholder="Song Name" value={song} onChange={e => setSong(e.target.value)} /> 
            <Textarea minRows={6} placeholder="Lyrics" onChange={e => setLyrics(e.target.value)}/>
            <Button onClick={submitSong}>Submit Song</Button>
          </Stack>
        </FormControl>
      </Box>
    </Box>
  )

}