import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

import {
  Avatar,
  Badge,
  Container,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Skeleton,
  Tooltip,
  Typography,
} from '@mui/material';

import {
  FlagCircle,
} from '@mui/icons-material';

import { styled } from '@mui/material/styles';

import { useAuth } from '@context/AuthProvider';

import useAxios from '@api/axios';
import ENDPOINTS from '@api/endpoints';

import NotFound from '@components/404/NotFound';
import Navbar from '@components/navbar/Navbar';

import getFormattedTime from '@utils/Time';

import styles from '@styles/_globals.scss';

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: styles.color_green,
    color: styles.color_green,
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: -1,
      left: -1,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

const outline = (user) => {
  if (user.is_superuser) {
    return `3px solid ${styles.color_red}`;
  }
  if (user.is_staff) {
    return `3px solid ${styles.color_yellow}`;
  }
  return `3px solid ${styles.color_blue}`;
};

const User = () => {
  const { profile } = useAuth();

  const { username } = useParams();

  const [{ loading, data: user, error }] = useAxios(
    {
      url: `${ENDPOINTS.user}${username}/`,
      method: 'GET',
    },
  );

  const [anchorElUser, setAnchorElUser] = useState(null);
  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  const [openTooltip, setOpenTooltip] = useState(false);

  const getLastOnline = () => {
    const datetime = new Date(new Date(user.last_seen) - new Date().getTimezoneOffset() * 60000);
    return `Was online ${getFormattedTime(datetime)}`;
  };

  if (!loading && error) {
    return <NotFound />;
  }

  return (
    <>
      <Navbar />
      <div className="User">
        <Container>
          <Grid container sx={{ textAlign: 'center' }}>
            <Grid item xs={5} sm={4}>
              <Tooltip
                title={!loading && !user.online && user.last_seen && getLastOnline()}
                arrow
                placement="top"
                disableTouchListener
              >
                <IconButton onClick={handleOpenUserMenu} sx={{ mb: 1, p: 0 }}>
                  {loading ? (
                    <Skeleton
                      variant="circular"
                      sx={{
                        height: {
                          xs: 84,
                          sm: 128,
                        },
                        width: {
                          xs: 84,
                          sm: 128,
                        },
                      }}
                    />
                  ) : (
                    <StyledBadge
                      overlap="circular"
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                      }}
                      variant={user.online ? 'dot' : 'standard'}
                    >
                      <Avatar
                        alt={user.username}
                        src={user.avatar}
                        sx={{
                          height: {
                            xs: 84,
                            sm: 128,
                          },
                          width: {
                            xs: 84,
                            sm: 128,
                          },
                          outline: outline(user),
                        }}
                      />
                    </StyledBadge>
                  )}
                </IconButton>
              </Tooltip>
              {!loading && profile.username !== username
              && (
              <Menu
                sx={{ mt: 2 }}
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
                  <FlagCircle sx={{ marginRight: 1 }} />
                  <Typography textAlign="center">Report</Typography>
                </MenuItem>
              </Menu>
              )}
              {loading ? (
                <Skeleton
                  variant="text"
                  sx={{ margin: 'auto' }}
                  width={256}
                  height={48}
                />
              ) : (
                <Typography
                  sx={{
                    fontSize: {
                      xs: styles.font_extra_small,
                      sm: styles.font_medium,
                    },
                    color: styles.color_white,
                    fontWeight: 'bold',
                  }}
                >
                  <span>{user.full_name ? user.full_name : user.username}</span>
                </Typography>
              )}
              {loading ? (
                <Skeleton
                  variant="text"
                  sx={{ margin: 'auto' }}
                  width={128}
                  height={32}
                />
              ) : (
                <Tooltip
                  title="Copied to clipboard"
                  disableFocusListener
                  disableTouchListener
                  PopperProps={{
                    disablePortal: true,
                  }}
                  open={openTooltip}
                  onClose={() => setOpenTooltip(false)}
                >
                  <Typography
                    sx={{
                      fontSize: {
                        xs: styles.font_extra_small,
                        sm: styles.font_small,
                      },
                      color: styles.color_cyan,
                      fontWeight: 'bold',
                    }}
                  >
                    <span
                      role="presentation"
                      style={{ cursor: 'pointer' }}
                      onClick={() => { navigator.clipboard.writeText(`@${user.username}`); setOpenTooltip(true); }}
                    >
                      {`@${user.username}`}
                    </span>
                  </Typography>
                </Tooltip>
              )}
            </Grid>
            <Grid
              item
              xs={7}
              sm={8}
              sx={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Grid container>
                <Grid item xs={12} justifyContent="center">
                  {loading ? (
                    <Skeleton
                      variant="text"
                      sx={{ margin: 'auto' }}
                      width={128}
                      height={64}
                    />
                  ) : (
                    <Typography
                      sx={{
                        textTransform: 'uppercase',
                        fontSize: {
                          xs: styles.font_medium,
                          sm: styles.font_large,
                        },
                        color: styles.color_yellow,
                        fontWeight: 'bold',
                      }}
                    >
                      <span>About</span>
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12}>
                  {loading ? (
                    <Skeleton
                      variant="text"
                      height={64}
                    />
                  ) : (
                    <Typography
                      sx={{
                        fontSize: {
                          xs: styles.font_extra_small,
                          sm: styles.font_medium,
                        },
                        color: styles.color_white,
                      }}
                    >
                      <span>{user.about}</span>
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </div>
    </>
  );
};

export { StyledBadge };
export default User;
