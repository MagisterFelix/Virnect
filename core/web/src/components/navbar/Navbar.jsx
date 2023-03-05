import React, { useState } from 'react';

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
  Tooltip,
  Typography,
} from '@mui/material';

import { useAuth } from '@context/AuthProvider';

import useAxios from '@api/axios';
import ENDPOINTS from '@api/endpoints';

import styles from '@styles/_globals.scss';

const Navbar = () => {
  const auth = useAuth();

  const [{ error }, execute] = useAxios(
    {
      method: 'POST',
    },
    {
      manual: true,
    },
  );

  const [show, setShow] = useState(false);
  const handleHide = () => {
    setShow(false);
  };

  const handleLogout = async () => {
    try {
      await execute({
        url: ENDPOINTS.deauthorization,
      });
      auth.setIsAuthenticated(false);
    } catch (err) {
      setShow(true);
    }
  };

  const [anchorElUser, setAnchorElUser] = useState(null);
  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  return (
    <div className="Navbar">
      {auth.profile
      && (
      <AppBar
        position="fixed"
        sx={{ backgroundColor: styles.darker }}
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
                color: styles.white,
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
                  {auth.profile.full_name ? auth.profile.full_name : auth.profile.username}
                </Typography>
                <Typography
                  sx={{
                    marginY: -1,
                    fontSize: {
                      xs: styles.font_extra_small,
                      sm: styles.font_small,
                    },
                    color: styles.cyan,
                    fontWeight: 'bold',
                  }}
                >
                  @
                  {auth.profile.username}
                </Typography>
              </Container>
              <Tooltip title="Open menu">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar
                    src={auth.profile.avatar}
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
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: 1 }}
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <MenuItem onClick={handleLogout}>
                  <Typography textAlign="center">Logout</Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      )}
      {error && (
      <Snackbar open={show} autoHideDuration={3000} onClose={handleHide}>
        <Alert severity="error">Something went wrong...</Alert>
      </Snackbar>
      )}
    </div>
  );
};

export default Navbar;
