import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import {
  Alert,
  Box,
  Grid,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  TextField,
  Typography,
} from '@mui/material';

import { LoadingButton } from '@mui/lab';

import {
  AccountCircleOutlined,
  Login,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';

import { useAuth } from '@context/AuthProvider';

import styles from '@styles/_globals.scss';

import './Auth.scss';

const Authorization = () => {
  const { loading, login } = useAuth();

  const [alert, setAlert] = useState(null);

  const validation = {
    username: {
      required: 'This field may not be blank',
    },
    password: {
      required: 'This field may not be blank',
    },
  };

  const { control, handleSubmit, setError } = useForm();
  const handleOnSubmit = async (form) => {
    login(form, validation, setError, setAlert);
  };

  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => event.preventDefault();

  return (
    <div className="Authorization">
      <Paper
        sx={{
          m: 2,
          maxWidth: {
            xs: 0.9,
            sm: 0.8,
          },
          flexGrow: 1,
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        <Grid container>
          <Grid
            item
            xs={12}
            lg={6}
            p={4}
          >
            <Grid
              container
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <Grid item>
                <Typography
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    textTransform: 'uppercase',
                    fontSize: {
                      xs: styles.font_medium,
                      sm: styles.font_large,
                    },
                    fontWeight: 'bold',
                  }}
                >
                  <Box
                    component="img"
                    src="/static/logo.svg"
                    alt="logo"
                    p={1}
                    sx={{
                      height: {
                        xs: 64,
                        sm: 100,
                      },
                      width: {
                        xs: 64,
                        sm: 100,
                      },
                    }}
                  />
                  <span>Virnect</span>
                </Typography>
              </Grid>
              <Grid item>
                <Typography
                  sx={{
                    display: 'inline',
                    margin: 1,
                    fontFamily: styles.font_poppins,
                    fontSize: {
                      xs: styles.font_extra_small,
                      sm: styles.font_medium,
                    },
                    fontWeight: 'bold',
                    color: styles.color_purple,
                  }}
                >
                  <span>Login</span>
                </Typography>
                <Link
                  href="/sign-up"
                  underline="hover"
                  sx={{
                    display: 'inline',
                    margin: 1,
                    fontFamily: styles.font_poppins,
                    fontSize: {
                      xs: styles.font_extra_small,
                      sm: styles.font_medium,
                    },
                    color: styles.color_grey,
                  }}
                >
                  <span>Register</span>
                </Link>
              </Grid>
            </Grid>
            <Grid item mx={1}>
              <Typography
                sx={{
                  marginTop: 3,
                  textTransform: 'uppercase',
                  fontFamily: styles.font_poppins,
                  fontSize: {
                    xs: styles.font_medium,
                    sm: styles.font_large,
                  },
                  fontWeight: 'bold',
                }}
              >
                <span>Sign In</span>
              </Typography>
              <Typography
                sx={{
                  marginBottom: 3,
                  fontFamily: styles.font_poppins,
                  fontSize: {
                    xs: styles.font_extra_small,
                    sm: styles.font_medium,
                  },
                  color: styles.color_grey,
                }}
              >
                <span>Sign in to use the application</span>
              </Typography>
            </Grid>
            <Grid item mx={1} textAlign="center">
              <Box component="form" autoComplete="off">
                <Controller
                  name="username"
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
                      type="text"
                      label="Username or email"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <AccountCircleOutlined />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        marginY: 1,
                      }}
                      error={fieldError !== undefined}
                      helperText={fieldError ? fieldError.message || validation.username[fieldError.type] : ''}
                    />
                  )}
                />
                <Controller
                  name="password"
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
                      type={showPassword ? 'text' : 'password'}
                      label="Password"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="Toggle password visibility"
                              onClick={handleClickShowPassword}
                              onMouseDown={handleMouseDownPassword}
                              edge="end"
                              sx={{
                                marginRight: -1,
                              }}
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        marginY: 1,
                      }}
                      error={fieldError !== undefined}
                      helperText={fieldError ? fieldError.message || validation.password[fieldError.type] : ''}
                    />
                  )}
                />
                {alert && <Alert severity={alert.type} sx={{ textAlign: 'left', my: 1 }}>{alert.message}</Alert>}
                <Link
                  href="/reset-password"
                  underline="hover"
                  sx={{
                    display: 'block',
                    marginY: 2,
                    textAlign: 'right',
                    fontSize: {
                      xs: styles.font_extra_small,
                      sm: styles.font_medium,
                    },
                    color: styles.color_grey,
                  }}
                >
                  <span>Forgot password?</span>
                </Link>
                <LoadingButton
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  endIcon={<Login />}
                  loading={loading}
                  loadingPosition="end"
                  sx={{
                    marginY: 1,
                    maxWidth: {
                      xs: 150,
                      sm: 300,
                    },
                    borderRadius: 4,
                    textTransform: 'none',
                    fontFamily: styles.font_poppins,
                    fontSize: {
                      xs: styles.font_extra_small,
                      sm: styles.font_medium,
                    },
                  }}
                  onClick={handleSubmit(handleOnSubmit)}
                >
                  <span>Sign In</span>
                </LoadingButton>
              </Box>
            </Grid>
          </Grid>
          <Grid
            item
            lg={6}
            sx={{
              display: {
                xs: 'none',
                lg: 'flex',
              },
              justifyContent: 'center',
              backgroundImage: `url(${'/static/auth.svg'}), linear-gradient(to bottom, ${styles.color_purple}, ${styles.color_neon})`,
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />
        </Grid>
      </Paper>
    </div>
  );
};

export default Authorization;
