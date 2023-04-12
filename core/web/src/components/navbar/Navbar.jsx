import React, { useEffect, useMemo, useState } from 'react';

import { w3cwebsocket as W3CWebSocket } from 'websocket';

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
} from '@mui/icons-material';

import ENDPOINTS from '@api/endpoints';

import { useAuth } from '@context/AuthProvider';

import Notification from '@components/navbar/Notification';

import { OnlineBadge } from '@utils/Styles';

import styles from '@styles/_globals.scss';

import './Navbar.scss';

const Navbar = () => {
  const {
    profile, logout, notificationList, refetchNotificationList, viewNotification,
  } = useAuth();

  const underSm = useMediaQuery(useTheme().breakpoints.down('sm'));

  const notifications = notificationList.filter((notification) => notification.content);

  const handleOnLogout = () => logout();

  const [anchorElUser, setAnchorElUser] = useState(null);
  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  const [anchorElNotification, setAnchorElNotification] = useState(null);
  const handleOpenNotificationMenu = (event) => setAnchorElNotification(event.currentTarget);
  const handleCloseNotificationMenu = () => setAnchorElNotification(null);

  const socket = useMemo(() => new W3CWebSocket(`${ENDPOINTS.wsNotificationList}${profile.username}/`), []);

  useEffect(() => {
    socket.onmessage = async (message) => {
      const data = JSON.parse(message.data);
      if (data.type === 'notification_list_update') {
        await refetchNotificationList();
      }
    };
  }, [socket, refetchNotificationList]);

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
              <span style={{ display: underSm ? 'none' : 'flex' }}>Virnect</span>
            </Link>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <IconButton size="large" onClick={handleOpenNotificationMenu} sx={{ pr: 2, color: styles.color_white }}>
                <Badge
                  max={9}
                  badgeContent={notifications.filter(
                    (notification) => !notification.is_viewed,
                  ).length}
                  color="primary"
                >
                  <Notifications fontSize="large" sx={{ color: styles.color_white }} />
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
                    maxHeight: 500,
                    width: !underSm && 500,
                  },
                }}
                sx={{ mt: 1 }}
              >
                {notifications.length !== 0 ? notificationList.map((notification) => (
                  notification.content && (
                  <div
                    className="Notification"
                    key={notification.id}
                    style={{
                      marginTop: '0.5em',
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
                  )
                )) : (
                  <Typography sx={{ p: 2 }}>
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
