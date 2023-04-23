import React, { useState } from 'react';

import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Container,
  Divider,
  IconButton,
  Link,
  Menu,
  MenuItem,
  Popover, Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import {
  AccountCircle,
  ExitToApp,
  Notifications,
  Settings,
  Visibility,
} from '@mui/icons-material';

import { useAuth } from '@providers/AuthProvider';
import { useNotification } from '@providers/NotificationProvider';

import Notification from '@components/navbar/Notification';

import { OnlineBadge } from '@utils/Styles';

import styles from '@styles/_globals.scss';

import './Navbar.scss';

const Navbar = () => {
  const { profile, logout } = useAuth();

  const underSm = useMediaQuery(useTheme().breakpoints.down('sm'));

  const { notifications, viewNotification, viewAll } = useNotification();

  const handleOnLogout = () => logout();

  const [anchorElUser, setAnchorElUser] = useState(null);
  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  const [anchorElNotification, setAnchorElNotification] = useState(null);
  const handleOpenNotificationMenu = (event) => setAnchorElNotification(event.currentTarget);
  const handleCloseNotificationMenu = () => setAnchorElNotification(null);

  return (
    <div className="Navbar" style={{ marginBottom: '7.25em' }}>
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
                  height: 48,
                  width: 48,
                }}
              />
              <span style={{ display: underSm ? 'none' : 'flex', fontSize: styles.font_small }}>Virnect</span>
            </Link>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <IconButton
                onClick={handleOpenNotificationMenu}
                sx={{ color: styles.color_white }}
              >
                <Badge
                  max={9}
                  badgeContent={notifications.filter(
                    (notification) => !notification.is_viewed,
                  ).length}
                  color="primary"
                >
                  <Notifications sx={{ color: styles.color_white }} />
                </Badge>
              </IconButton>
              <Popover
                anchorEl={anchorElNotification}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
                open={Boolean(anchorElNotification)}
                onClose={handleCloseNotificationMenu}
                PaperProps={{
                  style: {
                    maxHeight: 450,
                    width: !underSm && 450,
                  },
                }}
                sx={{ mt: 2 }}
              >
                {notifications.filter((notification) => !notification.is_viewed).length ? (
                  <>
                    <Typography
                      component="span"
                      sx={{
                        my: 1,
                        mx: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>View all</span>
                      <IconButton
                        onClick={() => viewAll(notifications.filter(
                          (notification) => !notification.is_viewed,
                        ))}
                        sx={{ ml: 0.5 }}
                      >
                        <Visibility sx={{ color: styles.color_neon }} />
                      </IconButton>
                    </Typography>
                    <Divider />
                  </>
                ) : null}
                {notifications.length !== 0
                  ? notifications.map((notification) => (
                    <div
                      className="Notification"
                      key={notification.id}
                      style={{
                        backgroundColor: notification.is_viewed
                          ? styles.color_white
                          : styles.color_soft_neon,
                      }}
                    >
                      <Typography sx={{ p: 2 }}>
                        {Notification(notification, viewNotification)}
                      </Typography>
                      <Divider />
                    </div>
                  )) : (
                    <Typography textAlign="center" sx={{ p: 2 }}>
                      <span>No notifications</span>
                    </Typography>
                  )}
              </Popover>
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
                      height: 48,
                      width: 48,
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
                <MenuItem>
                  <Link
                    href={`/user/${profile.username}`}
                    underline="none"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      color: styles.color_black,
                    }}
                  >
                    <AccountCircle sx={{ mt: -0.25, mr: 1 }} />
                    <span>Profile</span>
                  </Link>
                </MenuItem>
                <MenuItem>
                  <Link
                    href="/settings"
                    underline="none"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      color: styles.color_black,
                    }}
                  >
                    <Settings sx={{ mt: -0.25, mr: 1 }} />
                    <span>Settings</span>
                  </Link>
                </MenuItem>
                <MenuItem onClick={handleOnLogout}>
                  <Typography
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      color: styles.color_black,
                    }}
                  >
                    <ExitToApp sx={{ mr: 1 }} />
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
