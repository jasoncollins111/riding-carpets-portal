'use client'

import { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import {
  List,
  ListItem,
  ListItemButton,
  ListSubheader,
  Sheet,
  Typography
} from '@mui/joy';
import axios from 'axios';

export default function RecentSetlists() {

  const [showList, setShowList] = useState([]);
  const [showSetlist, setShowSetlist] = useState([]);

  useEffect(() => {
    getShows();
  },[])

  async function getShows() {
    const result = await axios.get('/api/get-shows');
    const shows = result?.data?.shows?.rows;
    setShowList(shows);
  }

  async function getSetlist(show) {
    const { id } = show;
    try {
      const setlist = await axios.get("/api/get-setlist", {
        params: {
          id
        }
      });
      const songs = setlist?.data?.response?.rows;
      setShowSetlist(songs);
    } catch (error) {
      console.log('error', error);
    }
  }

  function formatDate(rawDate) {
    let date = new Date(rawDate); // Example date

    // Extract month, day, and year
    let month = date.getMonth() + 1; // Months are zero-based in JavaScript
    let day = date.getDate();
    let year = date.getFullYear();

    // Add leading zero to month and day if needed
    month = month < 10 ? 0 + month : month;
    day = day < 10 ? 0 + day : day;

    // Format the date as MM/DD/YYYY
    let formattedDate = `${month}/${day}/${year}`;
    return formattedDate;
  }

  return (
    <Box sx={{ml: "50px"}}>
      <Typography level="h1">Latest Shows</Typography>
      <Sheet
      variant="outlined"
      sx={{
        width: 320,
        maxHeight: 300,
        overflow: 'auto',
        borderRadius: 'sm',
      }}
    >
      <List>
        <ListItem nested>
          <ListSubheader sticky>Shows</ListSubheader>
          <List>
            {showList.map((show, idx) => (
              <ListItem key={idx}>
                <ListItemButton color="primary" onClick={() => getSetlist(show)}>{formatDate(show.date)} - {show.venue} {show.city}, {show.state}</ListItemButton>
              </ListItem>
            ))}
          </List>
        </ListItem>
      </List>
      
      </Sheet>
      <Sheet
        variant="outlined"
        sx={{
          width: 320,
          maxHeight: 300,
          overflow: 'auto',
          borderRadius: 'sm',
        }}
      >
        {
          showSetlist.length ? (
            <List>
              <ListItem nested>
                <ListSubheader sticky>Setlist</ListSubheader>
                <List>
                  {showSetlist.map((song, idx) => (
                    <ListItem key={idx}>{song.song_name}</ListItem>
                  ))}
                </List>
              </ListItem>
            </List>
          ) : <sp></sp>
        }
      </Sheet>
    </Box>
  )

}