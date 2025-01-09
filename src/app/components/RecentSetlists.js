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

  const [concertList, setConcertList] = useState([{concert: {}, setlist: []}]);

  useEffect(() => {
    getConcerts();
  },[])

  async function getConcerts() {
    const result = await axios.get('/api/get-concerts');
    const concerts = result?.data?.shows?.rows;
    console.log('concerts', concerts);
    // setConcertList(concerts);
    getSetlists(concerts);
  }

  async function getSetlists(latestConcerts) {
    const concertMap = await Promise.all(latestConcerts.map(async (concert) => {
        const { id } = concert;
        try {
          const setlist = await axios.get("/api/get-setlist", {
            params: {
              id
            }
          });
          const songs = setlist?.data?.response?.rows;
          return { concert, setlist: songs };
        } catch (error) {
          console.log('error', error);
          return { concert, setlist: [] };
        }
    }));
    setConcertList(concertMap);
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
        width:'60%',
        // maxHeight: 300,
        overflow: 'auto',
        borderRadius: 'sm',
      }}
    >
          <List>
            {concertList.map((concert, idx) => (
              <ListItem key={idx}>
                <ListItemButton color="primary" onClick={() => getSetlist(concert)}>
                  <Box>
                    {concert.concert.venue} - {concert.concert.city} - {formatDate(concert.concert.date)}
                    {concert.setlist.map((song, idx) => (
                      <Typography key={idx} level="body-sm">{song.song_name}</Typography>
                    ))}
                  </Box>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
      
      </Sheet>
    </Box>
  )

}