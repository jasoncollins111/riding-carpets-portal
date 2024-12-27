import {
  Box,
  Dropdown,
  Link,
  MenuButton,
  Menu,
  MenuItem,
} from '@mui/joy';

import RecentSetlists from "../components/RecentSetlists";
import Header from "../components/Header";

export default function Home() {

  return (
    <Box sx={{ height: "100vh" }}>
      <Header/>
      <Box sx={{width: "100%", marginTop:"30px" }}>
        <RecentSetlists />
      </Box>
    </Box>
  );
}
