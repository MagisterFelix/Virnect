import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import {
  Alert,
  Box,
  Grid,
  InputAdornment,
  Link,
  Paper,
  TextField,
  Typography,
} from '@mui/material';

import { LoadingButton } from '@mui/lab';

import {
  AccountCircleOutlined,
  EmailOutlined,
  Key,
  Login,
} from '@mui/icons-material';

import { useAuth } from '@context/AuthProvider';

import styles from '@styles/_globals.scss';

import './Auth.scss';

const Registration = () => {
  const { loading, loadingProfile, register } = useAuth();

  const [alert, setAlert] = useState(null);

  const validation = {
    username: {
      required: 'This field may not be blank.',
      maxLength: 'No more than 150 characters.',
      pattern: 'Provide the valid username.',
    },
    email: {
      required: 'This field may not be blank.',
      maxLength: 'No more than 150 characters.',
      pattern: 'Provide the valid email.',
    },
    password: {
      required: 'This field may not be blank.',
      minLength: 'At least 8 characters.',
      maxLength: 'No more than 128 characters.',
      pattern: 'Provide the valid password.',
    },
    confirm_password: {
      required: 'This field may not be blank.',
      validate: 'Password mismatch.',
    },
  };

  const {
    control, watch, handleSubmit, setError,
  } = useForm();
  const handleOnSubmit = async (form) => {
    setAlert(null);
    register(form, validation, setError, setAlert);
  };

  return (
    <div className="Registration">
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
                <Link
                  href="/sign-in"
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
                  <span>Login</span>
                </Link>
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
                  <span>Register</span>
                </Typography>
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
                <span>Sign Up</span>
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
                <span>Sign up to use the application</span>
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
                    maxLength: 150,
                    pattern: /^[\w]+$/,
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
                      margin="dense"
                      type="text"
                      label="Username"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <AccountCircleOutlined />
                          </InputAdornment>
                        ),
                      }}
                      error={fieldError !== undefined}
                      helperText={fieldError ? fieldError.message || validation.username[fieldError.type] : ''}
                    />
                  )}
                />
                <Controller
                  name="email"
                  control={control}
                  defaultValue=""
                  rules={{
                    required: true,
                    maxLength: 150,
                    pattern: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/,
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
                      type="email"
                      label="Email"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <EmailOutlined />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        marginY: 1,
                      }}
                      error={fieldError !== undefined}
                      helperText={fieldError ? fieldError.message || validation.email[fieldError.type] : ''}
                    />
                  )}
                />
                <Controller
                  name="password"
                  control={control}
                  defaultValue=""
                  rules={{
                    required: true,
                    minLength: 8,
                    maxLength: 128,
                    pattern: /^(?=.*\d)(?=.*[A-Za-z]).{8,128}$/,
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
                      margin="dense"
                      type="password"
                      label="Password"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Key />
                          </InputAdornment>
                        ),
                      }}
                      error={fieldError !== undefined}
                      helperText={fieldError ? fieldError.message || validation.password[fieldError.type] : ''}
                    />
                  )}
                />
                <Controller
                  name="confirm_password"
                  control={control}
                  defaultValue=""
                  rules={{
                    required: true,
                    validate: (password) => password === watch('password'),
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
                      margin="dense"
                      type="password"
                      label="Confirm password"
                      error={fieldError !== undefined}
                      helperText={fieldError ? validation.confirm_password[fieldError.type] : ''}
                    />
                  )}
                />
                {alert && <Alert severity={alert.type} sx={{ textAlign: 'left', my: 1 }}>{alert.message}</Alert>}
                <LoadingButton
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  endIcon={<Login />}
                  loading={loading && !loadingProfile}
                  loadingPosition="end"
                  sx={{
                    marginTop: 3,
                    maxWidth: {
                      xs: 150,
                      sm: 300,
                    },
                    borderRadius: 3,
                    textTransform: 'none',
                    fontFamily: styles.font_poppins,
                    fontSize: {
                      xs: styles.font_extra_small,
                      sm: styles.font_medium,
                    },
                  }}
                  onClick={handleSubmit(handleOnSubmit)}
                >
                  <span>Sign Up</span>
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

export default Registration;
