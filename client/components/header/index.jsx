import React, { useState } from 'react'
import {
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  Divider,
  MenuItem,
  ListItemIcon,
  Avatar,
} from '@mui/material'
import {
  Menu as MenuIcon,
  AccountCircle as AccountIcon,
  Api as APiIcon,
  Github as GithubIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Cog as SettingsIcon,
} from '/client/components/icons.jsx'

export default () => {
  const [navMenu, setNavMenu] = useState(null)
  const [userMenu, setUserMenu] = useState(null)

  return (
    <>
      <AppBar
        sx={{
          borderTop: 'none',
          borderLeft: 'none',
          borderRight: 'none',
          opacity: 1,
        }}
        position="fixed"
        color="inherit"
        variant="outlined"
      >
        <Toolbar
          disableGutters
          sx={{
            padding: theme => `0 ${theme.spacing(1)}`,
            paddingRight: theme => theme.spacing(0.5),
          }}
          variant="dense"
        >
          <IconButton
            aria-label="Show navigation menu"
            onClick={e => setNavMenu(e.currentTarget)}
            color="inherit"
            size="small"
          >
            <MenuIcon fontSize="small" />
          </IconButton>
          <Divider orientation="vertical" flexItem sx={{ marginLeft: t => t.spacing(1) }} />
          <IconButton
            aria-label="User menu"
            onClick={e => setUserMenu(e.currentTarget)}
            color="inherit"
            size="small"
            sx={{
              marginLeft: 'auto',
            }}
          >
            <AccountIcon fontSize="medium" />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* NAV MENU */}
      <Menu
        disableScrollLock
        variant="menu"
        anchorEl={navMenu}
        open={Boolean(navMenu)}
        onClose={() => setNavMenu(null)}
      >
        <MenuItem dense>
          <ListItemIcon>
            <APiIcon fontSize="small" />
          </ListItemIcon>
          API Docs
        </MenuItem>
        <MenuItem dense>
          <ListItemIcon>
            <GithubIcon fontSize="small" />
          </ListItemIcon>
          Source code
        </MenuItem>
      </Menu>

      {/* USER MENU */}
      <Menu
        variant="menu"
        disableScrollLock
        anchorEl={userMenu}
        open={Boolean(userMenu)}
        onClose={() => setUserMenu(null)}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              marginTop: theme => theme.spacing(1.5),
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                marginLeft: theme => theme.spacing(-0.5),
                marginRight: theme => theme.spacing(1),
              },
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          },
        }}
      >
        <MenuItem dense>
          <Avatar sizes="" /> Profile
        </MenuItem>
        <MenuItem dense>
          <Avatar fontSize="small" /> My account
        </MenuItem>
        <Divider />
        <MenuItem dense>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <MenuItem dense>
          <ListItemIcon>
            <LoginIcon fontSize="small" />
          </ListItemIcon>
          Log in
        </MenuItem>
        <MenuItem dense>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Log out
        </MenuItem>
      </Menu>
    </>
  )
}
