"use client"

import * as React from 'react';
import { usePathname } from 'next/navigation';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  Link,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const pages = [
  { link: '/', title: 'Setlists' },
  { link: '/songs', title: 'Songs' },
  { link: '/stats', title: 'Stats' },
];

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleCloseMobile = () => {
    setMobileOpen(false);
  };

  const isActive = (link) => (link === '/' ? pathname === '/' : pathname.startsWith(link));

  const drawer = (
    <Box sx={{ width: 260, pt: 1 }} role="presentation">
      <Typography
        variant="h6"
        sx={{ px: 2, py: 1.5, fontFamily: 'monospace', fontWeight: 700, letterSpacing: '.2rem' }}
      >
        RC Portal
      </Typography>
      <List>
        {pages.map((item) => (
          <ListItemButton
            key={item.title}
            component="a"
            href={item.link}
            onClick={handleCloseMobile}
            selected={isActive(item.link)}
            sx={{ minHeight: 48 }}
          >
            <ListItemText primary={item.title} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open navigation menu"
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{ display: { md: 'none' }, mr: 1, minWidth: 44, minHeight: 44 }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: 'flex',
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: { xs: '.15rem', md: '.3rem' },
              color: 'inherit',
              textDecoration: 'none',
              fontSize: { xs: '1rem', sm: '1.15rem' },
            }}
          >
            RC Portal
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Link
                key={page.title}
                href={page.link}
                sx={{
                  my: 2,
                  color: 'white',
                  display: 'block',
                  textDecoration: 'none',
                  px: 2,
                  minHeight: 44,
                  lineHeight: '44px',
                }}
              >
                {page.title}
              </Link>
            ))}
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={handleCloseMobile}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { md: 'none' } }}
      >
        {drawer}
      </Drawer>
    </>
  );
}
