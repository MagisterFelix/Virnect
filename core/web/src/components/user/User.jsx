import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

import {
  Avatar,
  Box,
  Container,
  Grid,
  IconButton,
  Skeleton,
  Tooltip,
  Typography,
} from '@mui/material';

import { LoadingButton } from '@mui/lab';

import {
  Close,
  FlagCircle,
} from '@mui/icons-material';

import { useAuth } from '@context/AuthProvider';

import useAxios from '@api/axios';
import ENDPOINTS from '@api/endpoints';

import NotFound from '@components/404/NotFound';
import Navbar from '@components/navbar/Navbar';
import Report from '@components/report/Report';

import {
  LightTooltip,
  OnlineBadge,
  outline,
} from '@utils/Styles';
import getFormattedTime from '@utils/Time';

import styles from '@styles/_globals.scss';

const User = () => {
  const { profile } = useAuth();

  const { username } = useParams();

  const [{ loading: loadingUser, data: user, error: errorUser }] = useAxios(
    {
      url: `${ENDPOINTS.user}${username}/`,
      method: 'GET',
    },
  );

  const [anchorElUser, setAnchorElUser] = useState(null);
  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);

  const [openTooltip, setOpenTooltip] = useState(false);
  const handleClickUsername = () => { navigator.clipboard.writeText(`@${user.username}`); setOpenTooltip(true); };

  const getLastOnline = () => {
    const datetime = new Date(new Date(user.last_seen) - new Date().getTimezoneOffset() * 60000);
    return `Was online ${getFormattedTime(datetime)}`;
  };

  if (!loadingUser && errorUser) {
    return <NotFound />;
  }

  return (
    <>
      <Navbar />
      <div className="User">
        <Container>
          <Grid container sx={{ textAlign: 'center' }}>
            <Grid item xs={5} sm={4}>
              <LightTooltip
                title={!loadingUser && !user.online && user.last_seen && getLastOnline()}
                arrow
                placement="top"
                disableTouchListener
              >
                <IconButton onClick={handleOpenUserMenu} sx={{ mb: 1, p: 0 }}>
                  {loadingUser ? (
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
                    <OnlineBadge
                      overlap="circular"
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                      }}
                      variant={user.online ? 'dot' : 'standard'}
                    >
                      <Avatar
                        alt={user.username}
                        src={user.image}
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
                    </OnlineBadge>
                  )}
                </IconButton>
              </LightTooltip>
              {!loadingUser && profile.username !== username
              && (
                <Report
                  profile={profile}
                  user={user}
                  anchorElUser={anchorElUser}
                  setAnchorElUser={setAnchorElUser}
                />
              )}
              {loadingUser ? (
                <Skeleton
                  variant="text"
                  sx={{
                    margin: 'auto',
                  }}
                  width="75%"
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
              {loadingUser ? (
                <Skeleton
                  variant="text"
                  sx={{
                    margin: 'auto',
                  }}
                  width="50%"
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
                      onClick={handleClickUsername}
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
                  {loadingUser ? (
                    <Skeleton
                      variant="text"
                      sx={{
                        margin: 'auto',
                      }}
                      width="50%"
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
                  {loadingUser ? (
                    <Skeleton
                      variant="rounded"
                      sx={{
                        margin: 'auto',
                      }}
                      height={140}
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
                      <span>
                        {user.about.length
                          ? user.about
                          : `We don't know much about ${user.username}, but we're sure ${user.username} is great.`}
                      </span>
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

export default User;
