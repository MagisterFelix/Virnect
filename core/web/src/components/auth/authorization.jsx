import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import '@fontsource/poppins/400.css';
import '@fontsource/poppins/700.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/900.css';

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

import useAxios from '@api/axios';
import ENDPOINTS from '@api/endpoints';

import colors from '@styles/colors.sass';
import vars from '@styles/vars.sass';

import './auth.sass';

const Authorization = () => {
  const [{ error, loading }, execute] = useAxios(
    {
      url: ENDPOINTS.authorization,
      method: 'POST',
    },
    {
      manual: true,
    },
  );

  const navigate = useNavigate();

  const helper = {
    username: {
      required: 'This field may not be blank',
    },
    password: {
      required: 'This field may not be blank',
    },
  };

  const { control, handleSubmit } = useForm();
  const handleOnSubmit = (form) => {
    execute({ data: form })
      .then(() => navigate('/', { replace: true }))
      .catch((e) => e);
  };

  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => event.preventDefault();

  return (
    <div className="Authorization">
      <Paper
        sx={{
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
          <Grid item xs={12} md={12} lg={12} xl={6} p={4}>
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
                      xs: vars.font_medium,
                      sm: vars.font_large,
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
                    fontFamily: vars.font_poppins,
                    fontSize: {
                      xs: vars.font_small,
                      sm: vars.font_medium,
                    },
                    fontWeight: 'bold',
                    color: colors.purple,
                  }}
                >
                  <span>Login</span>
                </Typography>
                <Link
                  href="/sign-up"
                  underline="none"
                  sx={{
                    display: 'inline',
                    margin: 1,
                    fontFamily: vars.font_poppins,
                    fontSize: {
                      xs: vars.font_small,
                      sm: vars.font_medium,
                    },
                    color: colors.grey,
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
                  fontFamily: vars.font_poppins,
                  fontSize: {
                    xs: vars.font_medium,
                    sm: vars.font_large,
                  },
                  fontWeight: 'bold',
                }}
              >
                <span>Sign In</span>
              </Typography>
              <Typography
                sx={{
                  marginBottom: 3,
                  fontFamily: vars.font_poppins,
                  fontSize: {
                    xs: vars.font_small,
                    sm: vars.font_medium,
                  },
                  color: colors.grey,
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
                  render={({ field: { onChange, value }, fieldState: { error: fieldError } }) => (
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
                      helperText={fieldError ? helper.username[fieldError.type] : ''}
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
                  render={({ field: { onChange, value }, fieldState: { error: fieldError } }) => (
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
                      helperText={fieldError ? helper.password[fieldError.type] : ''}
                    />
                  )}
                />
                {error && <Alert severity="error" sx={{ textAlign: 'left' }}>There is no user with these credentials</Alert>}
                <Link
                  href="/forgot-password"
                  underline="hover"
                  sx={{
                    display: 'block',
                    marginY: 2,
                    textAlign: 'right',
                    fontSize: {
                      xs: vars.font_small,
                      sm: vars.font_medium,
                    },
                    color: colors.grey,
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
                    fontFamily: vars.font_poppins,
                    fontSize: {
                      xs: vars.font_small,
                      sm: vars.font_medium,
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
            xl={6}
            sx={{
              display: {
                xl: 'flex', lg: 'none', xs: 'none', md: 'none', sm: 'none',
              },
              justifyContent: 'center',
              backgroundImage: `url(${'/static/login.svg'}), linear-gradient(to bottom, ${colors.purple}, ${colors.blue})`,
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
