import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Container,
  IconButton,
  Link,
  Menu,
  MenuItem, Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import {
  AccountCircle,
  ExitToApp,
  Notifications,
  Settings,
} from '@mui/icons-material';

import { useAuth } from '@context/AuthProvider';

import { OnlineBadge } from '@utils/Styles';

import styles from '@styles/_globals.scss';

import './Navbar.scss';

const Navbar = () => {
  const navigate = useNavigate();

  const { profile, logout } = useAuth();

  const [anchorElUser, setAnchorElUser] = useState(null);
  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  const navigateToProfile = () => navigate(`/user/${profile.username}`);
  const navigateToSettings = () => navigate('/settings');
  const handleOnLogout = () => logout();

  return (
    <div className="Navbar">
      <AppBar position="fixed" sx={{ backgroundColor: styles.color_darker }}>
        <Container maxWidth="xl">
          <Toolbar
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <Link
              href="/"
              underline="none"
              sx={{
                display: 'flex',
                alignItems: 'center',
                textTransform: 'uppercase',
                color: styles.color_white,
                fontSize: styles.font_medium,
                fontWeight: 'bold',
              }}
            >
              <Box
                component="img"
                src="/static/logo.svg"
                alt="logo"
                py={2}
                pr={2}
                sx={{
                  height: 64,
                  width: 64,
                }}
              />
              <span style={{ display: useMediaQuery(useTheme().breakpoints.down('sm')) ? 'none' : 'flex' }}>Virnect</span>
            </Link>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <IconButton size="large" sx={{ color: styles.color_white }}>
                <Badge max={9} color="primary">
                  <Notifications fontSize="large" sx={{ color: styles.color_white }} />
                </Badge>
              </IconButton>
              <IconButton onClick={handleOpenUserMenu} sx={{ pr: 0 }}>
                <OnlineBadge
                  overlap="circular"
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  variant="dot"
                >
                  <Avatar
                    alt={profile.username}
                    src={profile.image}
                    sx={{
                      height: 64,
                      width: 64,
                    }}
                  />
                </OnlineBadge>
              </IconButton>
              <Menu
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <MenuItem onClick={navigateToProfile}>
                  <AccountCircle sx={{ mr: 1 }} />
                  <Typography textAlign="center">
                    <span>Profile</span>
                  </Typography>
                </MenuItem>
                <MenuItem onClick={navigateToSettings}>
                  <Settings sx={{ mr: 1 }} />
                  <Typography textAlign="center">
                    <span>Settings</span>
                  </Typography>
                </MenuItem>
                <MenuItem onClick={handleOnLogout}>
                  <ExitToApp sx={{ mr: 1 }} />
                  <Typography textAlign="center">
                    <span>Logout</span>
                  </Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </div>
  );
};

export default Navbar;
