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

  const [concertList, setConcertList] = useState([]);
  const [concertSetlist, setConcertSetlist] = useState([]);

  useEffect(() => {
    getConcerts();
  },[])

  async function getConcerts() {
    const result = await axios.get('/api/get-concerts');
    const concerts = result?.data?.shows?.rows;
    console.log('concerts', concerts);
    setConcertList(concerts);
    // getSetlist(concerts[0]);
  }

  async function getSetlist(concert) {
    const { id } = concert;
    try {
      const setlist = await axios.get("/api/get-setlist", {
        params: {
          id
        }
      });
      const songs = setlist?.data?.response?.rows;
      setConcertSetlist(songs);
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
  console.log("concertList", concertList);
  return (
    <Box sx={{ml: "50px"}}>
      <Typography level="h1">Latest Concerts</Typography>
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
          <ListSubheader sticky>Concerts</ListSubheader>
          <List>
            {concertList.map((concert, idx) => (
              <ListItem key={idx}>
                <ListItemButton color="primary" onClick={() => getSetlist(concert)}>{formatDate(concert.date)} - {concert.venue} {concert.city}, {concert.state}</ListItemButton>
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
          concertSetlist.length ? (
            <List>
              <ListItem nested>
                <ListSubheader sticky>Setlist</ListSubheader>
                <List>
                  {concertSetlist.map((song, idx) => (
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