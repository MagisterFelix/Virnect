import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

import {
  Avatar,
  Container,
  Grid,
  IconButton,
  Skeleton,
  Tooltip,
  Typography,
} from '@mui/material';

import useAxios from '@api/axios';
import ENDPOINTS from '@api/endpoints';

import { useAuth } from '@context/AuthProvider';

import NotFound from '@components/404/NotFound';
import Navbar from '@components/navbar/Navbar';
import Report from '@components/user/Report';

import { LightTooltip, OnlineBadge, outline } from '@utils/Styles';
import getFormattedTime from '@utils/Time';

import styles from '@styles/_globals.scss';

const User = () => {
  const { username } = useParams();

  const { profile } = useAuth();

  const [{ loading: loadingUser, data: user, error: errorUser }] = useAxios(
    {
      url: `${ENDPOINTS.user}${username}/`,
      method: 'GET',
    },
  );

  const [anchorElUser, setAnchorElUser] = useState(null);
  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);

  const [openTooltip, setOpenTooltip] = useState(false);
  const handleClickUsername = () => {
    navigator.clipboard.writeText(`@${user.username}`);
    setOpenTooltip(true);
  };

  const getLastOnline = () => `Was online ${getFormattedTime(user.last_seen)}`;

  if (!loadingUser && errorUser) {
    return <NotFound />;
  }

  return (
    <>
      <Navbar />
      <div className="User">
        <Container>
          <Grid container sx={{ textAlign: 'center' }}>
            <Grid item xs={12} md={4}>
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
                        height: 128,
                        width: 128,
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
                          height: 128,
                          width: 128,
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
              <Typography
                sx={{
                  fontSize: styles.font_medium,
                  color: styles.color_white,
                  fontWeight: 'bold',
                }}
              >
                {loadingUser
                  ? (
                    <Skeleton
                      width="75%"
                      sx={{
                        m: 'auto',
                      }}
                    />
                  )
                  : <span>{user.full_name ? user.full_name : user.username}</span>}
              </Typography>
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
                    fontSize: styles.font_small,
                    color: styles.color_cyan,
                    fontWeight: 'bold',
                  }}
                >
                  {loadingUser
                    ? (
                      <Skeleton
                        width="50%"
                        sx={{
                          m: 'auto',
                        }}
                      />
                    )
                    : (
                      <span
                        role="presentation"
                        style={{ cursor: 'pointer' }}
                        onClick={handleClickUsername}
                      >
                        {`@${user.username}`}
                      </span>
                    )}
                </Typography>
              </Tooltip>
            </Grid>
            <Grid
              item
              xs={12}
              md={8}
              sx={{
                display: 'flex',
                alignItems: 'center',
                mt: {
                  xs: 5,
                  md: 0,
                },
              }}
            >
              <Grid container>
                <Grid item xs={12} justifyContent="center">
                  <Typography
                    sx={{
                      textTransform: 'uppercase',
                      fontSize: styles.font_large,
                      color: styles.color_yellow,
                      fontWeight: 'bold',
                    }}
                  >
                    {loadingUser
                      ? (
                        <Skeleton
                          width="30%"
                          sx={{
                            m: 'auto',
                          }}
                        />
                      )
                      : <span>About</span>}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography
                    sx={{
                      fontSize: styles.font_medium,
                      color: styles.color_white,
                    }}
                  >
                    {loadingUser
                      ? (
                        <Skeleton
                          width="75%"
                          sx={{
                            m: 'auto',
                          }}
                        />
                      )
                      : (
                        <span>
                          {user.about.length
                            ? user.about
                            : `We don't know much about ${user.username}, but we're sure ${user.username} is great.`}
                        </span>
                      )}
                  </Typography>
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
