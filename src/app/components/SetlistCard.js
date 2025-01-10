
import { Box } from '@mui/material';
import { Sheet } from '@mui/joy';

export default function SetlistCard({setlist, setlistTitle}) {


  return (
    <Box sx={{ ml: '50px', justifyContent: "center" }}>
      <p>{setlistTitle}:</p>
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
          return <p key={idx}>{song.song_name}{songTransitionSymbol}</p>
        })}
      </Sheet>
    </Box>
  )


}
