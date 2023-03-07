import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Alert,
  AppBar,
  Avatar,
  Box,
  Container,
  IconButton,
  Link,
  Menu,
  MenuItem,
  Snackbar,
  Toolbar,
  Typography,
} from '@mui/material';

import {
  AccountCircle,
  ExitToApp,
} from '@mui/icons-material';

import { useAuth } from '@context/AuthProvider';

import { StyledBadge } from '@components/user/User';

import styles from '@styles/_globals.scss';

import './Navbar.scss';

const Navbar = () => {
  const { profile, logout } = useAuth();

  const [alert, setAlert] = useState(false);

  const navigate = useNavigate();

  const navigateToProfile = () => {
    navigate(`/user/${profile.username}`);
  };

  const handleLogout = () => {
    logout(setAlert);
  };

  const [anchorElUser, setAnchorElUser] = useState(null);
  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  return (
    <div className="Navbar">
      <AppBar
        position="fixed"
        sx={{ backgroundColor: styles.color_darker }}
      >
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
                fontSize: {
                  xs: styles.font_extra_small,
                  sm: styles.font_medium,
                },
                fontWeight: 'bold',
              }}
            >
              <Box
                component="img"
                src="/static/logo.svg"
                alt="logo"
                p={2}
                sx={{
                  height: {
                    xs: 48,
                    sm: 64,
                  },
                  width: {
                    xs: 48,
                    sm: 64,
                  },
                }}
              />
              <span>Virnect</span>
            </Link>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Container
                sx={{
                  textAlign: 'right',
                  display: {
                    xs: 'none',
                    md: 'block',
                  },
                }}
              >
                <Typography
                  sx={{
                    marginY: -1,
                    fontSize: {
                      xs: styles.font_extra_small,
                      sm: styles.font_medium,
                    },
                    fontWeight: 'bold',
                  }}
                >
                  {profile.full_name ? profile.full_name : profile.username}
                </Typography>
                <Typography
                  sx={{
                    marginY: -1,
                    fontSize: {
                      xs: styles.font_extra_small,
                      sm: styles.font_small,
                    },
                    color: styles.color_cyan,
                    fontWeight: 'bold',
                  }}
                >
                  <span>{`@${profile.username}`}</span>
                </Typography>
              </Container>
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <StyledBadge
                  overlap="circular"
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  variant="dot"
                >
                  <Avatar
                    alt={profile.username}
                    src={profile.avatar}
                    sx={{
                      height: {
                        xs: 48,
                        sm: 64,
                      },
                      width: {
                        xs: 48,
                        sm: 64,
                      },
                    }}
                  />
                </StyledBadge>
              </IconButton>
              <Menu
                sx={{ mt: 3 }}
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
                  <AccountCircle sx={{ marginRight: 1 }} />
                  <Typography textAlign="center">Profile</Typography>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <ExitToApp sx={{ marginRight: 1 }} />
                  <Typography textAlign="center">Logout</Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <Snackbar open={alert} autoHideDuration={3000} onClose={() => setAlert(false)}>
        <Alert severity="error">Something went wrong...</Alert>
      </Snackbar>
    </div>
  );
};

export default Navbar;
