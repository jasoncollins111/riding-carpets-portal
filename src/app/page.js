import { Box, Typography, Button, Stack } from '@mui/joy';
import Link from 'next/link';

export default function Home() {
  return (
    <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Stack spacing={3} sx={{ textAlign: 'center', maxWidth: 480 }}>
        <Typography level="h1">Riding Carpets Setlist Manager</Typography>
        <Typography level="body-lg">
          Track shows, songs, and setlists for the band.
        </Typography>
        <Stack direction="row" spacing={2} sx={{ justifyContent: 'center' }}>
          <Button component={Link} href="/setlists" size="lg">
            View Setlists
          </Button>
          <Button component={Link} href="/add-show" variant="outlined" size="lg">
            Add Show
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
