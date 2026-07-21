"use client"

import * as React from 'react';
import Image from 'next/image';
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
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const LOGO_HEIGHT = 43;
const LOGO_SRC = '/riding-carpets-logo.png';
const LOGO_WIDTH = 613;
const LOGO_HEIGHT_PX = 150;

const pages = [
  { link: '/', title: 'Setlists' },
  { link: '/songs', title: 'Songs' },
  { link: '/stats', title: 'Stats' },
];

const navLinkSx = (active) => ({
  my: 2,
  color: active ? '#008B8B' : '#1a1a1a',
  display: 'block',
  textDecoration: 'none',
  px: 2,
  minHeight: 44,
  lineHeight: '44px',
  fontFamily: 'var(--font-archivo-narrow), sans-serif',
  fontWeight: active ? 600 : 400,
  borderBottom: active ? '2px solid #008B8B' : '2px solid transparent',
  '&:hover': {
    color: '#008B8B',
  },
});

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleCloseMobile = () => {
    setMobileOpen(false);
  };

  const isActive = (link) => (link === '/' ? pathname === '/' : pathname.startsWith(link));

  const drawer = (
    <Box sx={{ width: 260, pt: 1, bgcolor: '#FBF8F4' }} role="presentation">
      <Box sx={{ px: 2, py: 1.5 }}>
        <Link href="/" onClick={handleCloseMobile} sx={{ display: 'inline-block' }}>
          <Image
            src={LOGO_SRC}
            alt="Riding Carpets"
            width={LOGO_WIDTH}
            height={LOGO_HEIGHT_PX}
            style={{ height: `${LOGO_HEIGHT}px`, width: 'auto' }}
            priority
          />
        </Link>
      </Box>
      <List>
        {pages.map((item) => (
          <ListItemButton
            key={item.title}
            component="a"
            href={item.link}
            onClick={handleCloseMobile}
            selected={isActive(item.link)}
            sx={{
              minHeight: 48,
              fontFamily: 'var(--font-archivo-narrow), sans-serif',
              '&.Mui-selected': {
                color: '#008B8B',
                borderLeft: '3px solid #008B8B',
              },
            }}
          >
            <ListItemText primary={item.title} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: '#FBF8F4',
          color: '#1a1a1a',
          borderBottom: '1px solid rgba(43, 75, 140, 0.12)',
        }}
      >
        <Toolbar>
          <IconButton
            aria-label="open navigation menu"
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{
              display: { md: 'none' },
              mr: 1,
              minWidth: 44,
              minHeight: 44,
              color: '#1a1a1a',
            }}
          >
            <MenuIcon />
          </IconButton>

          <Link
            href="/"
            sx={{
              mr: 2,
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              minHeight: 44,
            }}
          >
            <Image
              src={LOGO_SRC}
              alt="Riding Carpets"
              width={LOGO_WIDTH}
              height={LOGO_HEIGHT_PX}
              style={{ height: `${LOGO_HEIGHT}px`, width: 'auto' }}
              priority
            />
          </Link>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Link
                key={page.title}
                href={page.link}
                sx={navLinkSx(isActive(page.link))}
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
