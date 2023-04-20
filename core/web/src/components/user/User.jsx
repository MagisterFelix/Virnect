import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

import {
  Avatar,
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

import useAxios from '@api/axios';
import ENDPOINTS from '@api/endpoints';

import { useAuth } from '@providers/AuthProvider';

import NotFound from '@components/404/NotFound';
import RoomList from '@components/main/RoomList';

import { ReportDialog } from '@utils/Dialogs';
import { LightTooltip, OnlineBadge, outline } from '@utils/Styles';
import { getFormattedTime } from '@utils/Time';

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
  const handleCloseUserMenu = () => setAnchorElUser(null);

  const [openTooltip, setOpenTooltip] = useState(false);
  const handleClickUsername = () => {
    navigator.clipboard.writeText(`@${user.username}`);
    setOpenTooltip(true);
  };

  const [openReportDialog, setOpenReportDialog] = useState(false);
  const handleOpenReportDialog = () => setOpenReportDialog(true);
  const handleCloseReportDialog = () => {
    setOpenReportDialog(false);
    handleCloseUserMenu();
  };

  const getLastOnline = () => `Was online ${getFormattedTime(user.last_seen)}`;

  if (!loadingUser && errorUser) {
    return <NotFound extraStyles={{ marginTop: '-6.25em' }} />;
  }

  return (
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
                        outlineOffset: '2px',
                      }}
                    />
                  </OnlineBadge>
                )}
              </IconButton>
            </LightTooltip>
            {profile.username !== username && (
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
                sx={{ mt: 1 }}
              >
                {!loadingUser && (
                <MenuItem onClick={handleOpenReportDialog}>
                  <FlagCircle sx={{ mr: 1 }} />
                  <Typography textAlign="center" sx={{ mt: 0.2 }}>
                    <span>Report</span>
                  </Typography>
                </MenuItem>
                )}
                <ReportDialog
                  open={openReportDialog}
                  close={handleCloseReportDialog}
                  user={user}
                />
              </Menu>
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
              my: {
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
          <Grid container>
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography
                sx={{
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
                  : <span>Host of rooms:</span>}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <RoomList editable={!loadingUser && profile.username === username} />
      </Container>
    </div>
  );
};

export default User;
