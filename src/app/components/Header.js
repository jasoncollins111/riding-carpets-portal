"use client"

import * as React from 'react';
import { usePathname } from 'next/navigation';
import {
  AppBar,
  Avatar,
  Box,
  Drawer,
  IconButton,
  Link,
  List,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const pages = [
  { link: '/', title: 'Setlists' },
  { link: '/songs', title: 'Songs' },
];
const settings = [
  { link: '/add-song', title: 'Add Song' },
  { link: '/add-show', title: 'Add Show' },
];

const allNavItems = [...pages, ...settings];

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

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
        {allNavItems.map((item) => (
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

          <Box sx={{ flexGrow: 0, display: { xs: 'none', md: 'block' } }}>
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 1, minWidth: 44, minHeight: 44 }}>
              <Avatar alt="RC Portal" sx={{ width: 36, height: 36 }} />
            </IconButton>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem key={setting.title} onClick={handleCloseUserMenu} sx={{ minHeight: 48 }}>
                  <Link sx={{ textAlign: 'center', width: '100%' }} href={setting.link}>
                    {setting.title}
                  </Link>
                </MenuItem>
              ))}
            </Menu>
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
