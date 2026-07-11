import {
  Box,
  Typography,
} from '@mui/joy';

import RecentSetlists from './components/RecentSetlists';

export default function Home() {
  return (
    <Box sx={{ minHeight: '100dvh' }}>
      <Box
        sx={{
          px: { xs: 2, sm: 3, md: 6 },
          py: { xs: 2, md: 4 },
          maxWidth: 900,
          mx: 'auto',
        }}
      >
        <Typography level="h1" sx={{ mb: 3 }}>
          Setlists
        </Typography>
        <RecentSetlists />
      </Box>
    </Box>
  );
}
