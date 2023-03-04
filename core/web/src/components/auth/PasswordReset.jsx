import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';

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
  EmailOutlined,
  Key,
  Send,
} from '@mui/icons-material';

import useAxios from '@api/axios';
import ENDPOINTS from '@api/endpoints';
import handleErrors from '@api/errors';

import styles from '@styles/_globals.scss';

import './Auth.scss';

const PasswordReset = () => {
  const { uid, token } = useParams();

  const [alert, setAlert] = useState(null);

  const [{ loading }, execute] = useAxios(
    {
      method: 'POST',
    },
    {
      manual: true,
    },
  );

  const navigate = useNavigate();

  const validation = {
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
    try {
      const response = await execute({
        url: ENDPOINTS.reset_password + ((uid && token) ? `${uid}/${token}/` : ''),
        data: form,
      });
      setAlert({ type: 'success', message: response.data.details });
      if (uid && token) {
        navigate('/sign-in', { replace: true });
      }
    } catch (error) {
      handleErrors(validation, error.response.data.details, setError, setAlert);
    }
  };

  return (
    <div className="PasswordReset">
      <Paper
        sx={{
          m: 2,
          maxWidth: {
            xs: 0.8,
            sm: 0.6,
            md: 0.5,
            lg: 0.4,
            xl: 0.3,
          },
          flexGrow: 1,
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        <Grid container>
          <Grid item xs={12} p={4}>
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
                  underline="none"
                  sx={{
                    display: 'inline',
                    margin: 1,
                    fontFamily: styles.font_poppins,
                    fontSize: {
                      xs: styles.font_small,
                      sm: styles.font_medium,
                    },
                    color: styles.grey,
                  }}
                >
                  <span>Login</span>
                </Link>
              </Grid>
            </Grid>
            <Grid item mx={1} my={1} textAlign="center">
              <Box component="form" autoComplete="off">
                {(uid && token)
                  ? (
                    <>
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
                            type="password"
                            label="Password"
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <Key />
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
                            type="password"
                            label="Confirm password"
                            sx={{
                              marginY: 1,
                            }}
                            error={fieldError !== undefined}
                            helperText={fieldError ? validation.confirm_password[fieldError.type] : ''}
                          />
                        )}
                      />
                    </>
                  ) : (
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
                            marginY: 2,
                          }}
                          error={fieldError !== undefined}
                          helperText={fieldError ? fieldError.message || validation.email[fieldError.type] : ''}
                        />
                      )}
                    />
                  )}
                {alert && <Alert severity={alert.type} sx={{ textAlign: 'left' }}>{alert.message}</Alert>}
                <LoadingButton
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  endIcon={<Send />}
                  loading={loading}
                  loadingPosition="end"
                  sx={{
                    marginTop: 2,
                    marginBottom: 1,
                    maxWidth: {
                      xs: 150,
                      sm: 300,
                    },
                    borderRadius: 4,
                    textTransform: 'none',
                    fontFamily: styles.font_poppins,
                    fontSize: {
                      xs: styles.font_small,
                      sm: styles.font_medium,
                    },
                  }}
                  onClick={handleSubmit(handleOnSubmit)}
                >
                  <span>Submit</span>
                </LoadingButton>
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
};

export default PasswordReset;
