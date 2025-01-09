import {
  Box,
  Typography,
  Container,
} from '@mui/joy';

import RecentSetlists from "./components/RecentSetlists";

export default function Home() {
  return (
    <Box sx={{ height: "100vh" }}>
        <Box sx={{ my: 4 }}>
          <Typography level="h1" sx={{ mb: 3, ml: 6 }}>
            Setlists
          </Typography>
          <RecentSetlists />
        </Box>
    </Box>
  );
}
