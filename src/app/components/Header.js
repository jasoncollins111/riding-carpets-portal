"use client"

import * as React from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Menu,
  MenuItem,
  IconButton,
  Link,
  Toolbar,
  Typography
} from '@mui/material';

const pages = [
  { link: '/', title: 'Setlists' },
  { link: '/songs', title: 'Songs' },
];
const settings = [
  { link: '/add-song', title: 'Add Song' },
  { link: '/add-show', title: 'Add Show' },
];

export default function Header() {
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          noWrap
          component="a"
          href="/"
          sx={{
            ml: '20px',
            mr: '20px',
            display: 'flex',
            fontFamily: 'monospace',
            fontWeight: 700,
            letterSpacing: '.3rem',
            color: 'inherit',
            textDecoration: 'none',
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
              }}
            >
              {page.title}
            </Link>
          ))}
        </Box>
        <Box sx={{ flexGrow: 0 }}>
          <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
            <Avatar alt="RC Portal" src="/static/images/avatar/2.jpg" />
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
              <MenuItem key={setting.title} onClick={handleCloseUserMenu}>
                <Link sx={{ textAlign: 'center' }} href={setting.link}>
                  {setting.title}
                </Link>
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
