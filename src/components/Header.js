"use client"

import * as React from 'react';
import {
  AppBar,
  Avatar,
  Box, 
  Button,
  Menu,
  // MenuIcon,
  MenuItem, 
  IconButton,
  Link,
  Toolbar,
  // Tooltip,
  Typography
} from '@mui/material';

const pages = [{link: '/songs', title: 'Songs'}, {link: '/setlists', title: 'Setlists'}, {link: '/forum', title: 'Forum'}];
const settings = [{ link: "add-song", title: "Add Song" }, { link: "add-setlist", title: "Add Setlist" }];

export default function Header() {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
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
          RidingCarpets.net
        </Typography>

        {/* <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
          <Menu
            id="menu-appbar"
            anchorEl={anchorElNav}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            open={Boolean(anchorElNav)}
            onClose={handleCloseNavMenu}
            sx={{ display: { xs: 'block', md: 'none' } }}
          >
            {pages.map((page) => (
              <MenuItem key={page.title} onClick={handleCloseNavMenu}>
                <Link href={page.link} sx={{ textAlign: 'center' }}>{page.title}</Link>
              </MenuItem>
            ))}
          </Menu>
        </Box> */}

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
                px: 2
              }}
            >
              {page.title}
            </Link>
          ))}
        </Box>
        <Box sx={{ flexGrow: 0 }}>
          <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
            <Avatar alt="Riding Carpets" src="/static/images/avatar/2.jpg" />
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
                <Link sx={{ textAlign: 'center' }} href={setting.link}>{setting.title}</Link>
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
