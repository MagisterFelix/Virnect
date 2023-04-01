import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';

import {
  Alert,
  Avatar,
  Box,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  LinearProgress,
  Menu,
  MenuItem,
  Skeleton,
  TextField,
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
  const handleCloseUserMenu = () => setAnchorElUser(null);

  const [openTooltip, setOpenTooltip] = useState(false);
  const handleClickUsername = () => { navigator.clipboard.writeText(`@${user.username}`); setOpenTooltip(true); };

  const getLastOnline = () => {
    const datetime = new Date(new Date(user.last_seen) - new Date().getTimezoneOffset() * 60000);
    return `Was online ${getFormattedTime(datetime)}`;
  };

  const [{ loading: loadingReportOptions, data: reportOptions }] = useAxios(
    {
      url: ENDPOINTS.report,
      method: 'OPTIONS',
    },
  );

  const validation = {
    reason: {
      required: 'This field may not be blank',
    },
  };

  const [{ loading: loadingReport }, sendReport] = useAxios(
    {
      url: ENDPOINTS.report,
      method: 'POST',
    },
    {
      manual: true,
    },
  );

  const [alert, setAlert] = useState(null);
  const { control, handleSubmit, reset } = useForm();
  const handleOnSubmit = async (form) => {
    const formData = {
      sender: profile.id,
      suspect: user.id,
      ...form,
    };
    setAlert(null);
    try {
      const response = await sendReport({
        method: 'POST',
        data: formData,
      });
      setAlert({ type: 'success', message: response.data.details });
    } catch (err) {
      setAlert({ type: 'error', message: 'Something went wrong' });
    }
  };

  const [openReportDialog, setOpenReportDialog] = useState(false);
  const handleOpenReportDialog = () => {
    setAnchorElUser(null);
    reset();
    setAlert(null);
    setOpenReportDialog(true);
  };
  const handleCloseReportDialog = () => { setOpenReportDialog(false); };

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
                <>
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
                    <MenuItem onClick={handleOpenReportDialog}>
                      <FlagCircle sx={{ marginRight: 1 }} />
                      <Typography textAlign="center">Report</Typography>
                    </MenuItem>
                  </Menu>
                  <Dialog open={openReportDialog} onClose={handleCloseReportDialog} fullWidth>
                    <Box component="form" autoComplete="off">
                      <DialogTitle sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                      >
                        <span>Report</span>
                        <IconButton
                          aria-label="close"
                          sx={{ marginRight: -1 }}
                          onClick={handleCloseReportDialog}
                        >
                          <Close />
                        </IconButton>
                      </DialogTitle>
                      <DialogContent>
                        <Controller
                          name="reason"
                          control={control}
                          defaultValue=""
                          rules={{
                            required: true,
                          }}
                          render={({
                            field: { onChange, value },
                            fieldState: { error: fieldError },
                          }) => (
                            <TextField
                              onChange={onChange}
                              value={value}
                              required
                              fullWidth
                              select
                              margin="dense"
                              label="Reason"
                              error={fieldError !== undefined}
                              helperText={fieldError ? fieldError.message || validation.reason[fieldError.type] : ''}
                            >
                              {
                                loadingReportOptions
                                  ? (<LinearProgress sx={{ margin: 2 }} />)
                                  : (reportOptions.actions.POST.reason.choices.map(
                                    (choice) => (
                                      <MenuItem key={choice.value} value={choice.value}>
                                        {choice.display_name}
                                      </MenuItem>
                                    ),
                                  ))
                              }
                            </TextField>
                          )}
                        />
                        {alert && <Alert severity={alert.type} sx={{ textAlign: 'left', mt: 1 }}>{alert.message}</Alert>}
                      </DialogContent>
                      <DialogActions sx={{ marginX: 1 }}>
                        <LoadingButton
                          loading={loadingReport}
                          onClick={handleSubmit(handleOnSubmit)}
                        >
                          Report
                        </LoadingButton>
                      </DialogActions>
                    </Box>
                  </Dialog>
                </>
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
