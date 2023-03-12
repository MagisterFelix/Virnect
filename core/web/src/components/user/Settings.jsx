import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import {
  Alert,
  Box,
  Container,
  Grid,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from '@mui/material';

import { LoadingButton } from '@mui/lab';

import {
  BadgeOutlined,
  DescriptionOutlined,
  EmailOutlined,
  Key,
  Publish,
  UploadFileOutlined,
} from '@mui/icons-material';

import { useAuth } from '@context/AuthProvider';

import useAxios from '@api/axios';
import ENDPOINTS from '@api/endpoints';
import handleErrors from '@api/errors';

import Navbar from '@components/navbar/Navbar';

import styles from '@styles/_globals.scss';

const Settings = () => {
  const { loadingProfile, profile, refetchProfile } = useAuth();

  const [alertProfile, setAlertProfile] = useState(null);
  const [alertPassword, setAlertPassword] = useState(null);

  const validation = {
    email: {
      required: 'This field may not be blank.',
      maxLength: 'No more than 150 characters.',
      pattern: 'Provide the valid email.',
    },
    first_name: {
      maxLength: 'No more than 150 characters.',
    },
    last_name: {
      maxLength: 'No more than 150 characters.',
    },
    about: {
      maxLength: 'No more than 1024 characters.',
    },
    password: {
      required: 'This field may not be blank.',
      minLength: 'At least 8 characters.',
      maxLength: 'No more than 128 characters.',
      pattern: 'Provide the valid password.',
    },
  };

  const [{ loading: loadingUpdateProfile }, updateProfile] = useAxios(
    {
      url: ENDPOINTS.profile,
      method: 'PATCH',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
    {
      manual: true,
    },
  );

  const {
    control: controlProfile,
    handleSubmit: handleSubmitProfile,
    setError: setErrorProfile,
    reset: resetProfile,
  } = useForm();
  const handleOnSubmitProfile = async (form) => {
    setAlertProfile(null);
    const formData = Object.entries(form).filter((entry) => profile[`${entry[0]}`] !== entry[1]);
    if (formData.length === 0) {
      setAlertProfile({ type: 'info', message: 'Nothing to update.' });
    } else {
      try {
        const response = await updateProfile({
          data: Object.fromEntries(formData),
        });
        const updated = await refetchProfile();
        updated.data.image += `?t=${new Date().getTime()}`;
        resetProfile({
          image: updated.data.image,
        });
        setAlertProfile({ type: 'success', message: response.data.details });
      } catch (err) {
        handleErrors(validation, err.response.data.details, setErrorProfile, setAlertProfile);
      }
    }
  };

  const [{ loading: loadingChangePassword }, changePassword] = useAxios(
    {
      url: ENDPOINTS.profile,
      method: 'PATCH',
    },
    {
      manual: true,
    },
  );

  const {
    control: controlPassword,
    handleSubmit: handleSubmitPassword,
    setError: setErrorPassword,
  } = useForm();
  const handleOnSubmitPassword = async (form) => {
    setAlertPassword(null);
    try {
      const response = await changePassword({
        data: form,
      });
      setAlertPassword({ type: 'success', message: response.data.details });
    } catch (err) {
      handleErrors(validation, err.response.data.details, setErrorPassword, setAlertPassword);
    }
  };

  return (
    <>
      <Navbar />
      <div className="Settings">
        <Container>
          <Grid
            container
            sx={{
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Grid item md={8}>
              <Paper
                sx={{
                  m: 2,
                  p: 2,
                  flexGrow: 1,
                  borderRadius: 4,
                }}
              >
                <Grid container>
                  <Typography
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      margin: 'auto',
                      fontSize: {
                        xs: styles.font_medium,
                        sm: styles.font_large,
                      },
                      fontWeight: 'bold',
                    }}
                  >
                    <span>Profile</span>
                  </Typography>
                </Grid>
                <Grid container p={2}>
                  <Grid item mx={1} textAlign="right">
                    <Box component="form" autoComplete="off">
                      <Controller
                        name="email"
                        control={controlProfile}
                        defaultValue={profile.email}
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
                            margin="dense"
                            type="email"
                            label="Email"
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <EmailOutlined />
                                </InputAdornment>
                              ),
                            }}
                            error={fieldError !== undefined}
                            helperText={fieldError ? fieldError.message || validation.email[fieldError.type] : ''}
                          />
                        )}
                      />
                      <Controller
                        name="first_name"
                        control={controlProfile}
                        defaultValue={profile.first_name}
                        rules={{
                          maxLength: 150,
                        }}
                        render={({
                          field: { onChange, value },
                        }) => (
                          <TextField
                            onChange={onChange}
                            value={value}
                            fullWidth
                            margin="dense"
                            type="text"
                            label="First name"
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <BadgeOutlined />
                                </InputAdornment>
                              ),
                            }}
                          />
                        )}
                      />
                      <Controller
                        name="last_name"
                        control={controlProfile}
                        defaultValue={profile.last_name}
                        rules={{
                          maxLength: 150,
                        }}
                        render={({
                          field: { onChange, value },
                        }) => (
                          <TextField
                            onChange={onChange}
                            value={value}
                            fullWidth
                            margin="dense"
                            type="text"
                            label="Last name"
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <BadgeOutlined />
                                </InputAdornment>
                              ),
                            }}
                          />
                        )}
                      />
                      <Controller
                        name="about"
                        control={controlProfile}
                        defaultValue={profile.about}
                        rules={{
                          maxLength: 1024,
                        }}
                        render={({
                          field: { onChange, value },
                        }) => (
                          <TextField
                            onChange={onChange}
                            value={value}
                            fullWidth
                            multiline
                            margin="dense"
                            type="text"
                            label="About"
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <DescriptionOutlined />
                                </InputAdornment>
                              ),
                            }}
                          />
                        )}
                      />
                      <Controller
                        name="image"
                        control={controlProfile}
                        defaultValue={profile.image}
                        render={({
                          field: { onChange, value },
                          fieldState: { error: fieldError },
                        }) => (
                          <TextField
                            onChange={(event) => onChange(event.target.files[0])}
                            value={value && value.filename}
                            fullWidth
                            margin="dense"
                            type="file"
                            label="Image"
                            InputLabelProps={{ shrink: true }}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <UploadFileOutlined />
                                </InputAdornment>
                              ),
                            }}
                            error={fieldError !== undefined}
                            helperText={fieldError ? fieldError.message || validation.image[fieldError.type] : ''}
                          />
                        )}
                      />
                      {alertProfile && <Alert severity={alertProfile.type} sx={{ textAlign: 'left', my: 1 }}>{alertProfile.message}</Alert>}
                      <LoadingButton
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        endIcon={<Publish />}
                        loading={loadingUpdateProfile || loadingProfile}
                        loadingPosition="end"
                        sx={{
                          marginTop: 3,
                          maxWidth: {
                            xs: 125,
                            sm: 175,
                          },
                          borderRadius: 3,
                          textTransform: 'none',
                          fontFamily: styles.font_poppins,
                          fontSize: {
                            xs: styles.font_extra_small,
                            sm: styles.font_medium,
                          },
                        }}
                        onClick={handleSubmitProfile(handleOnSubmitProfile)}
                      >
                        <span>Update</span>
                      </LoadingButton>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            <Grid item md={4}>
              <Paper
                sx={{
                  m: 2,
                  p: 2,
                  flexGrow: 1,
                  borderRadius: 4,
                }}
              >
                <Grid container>
                  <Typography
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      margin: 'auto',
                      fontSize: {
                        xs: styles.font_medium,
                        sm: styles.font_large,
                      },
                      fontWeight: 'bold',
                    }}
                  >
                    <span>Password</span>
                  </Typography>
                </Grid>
                <Grid container p={2}>
                  <Grid item mx={1} textAlign="right">
                    <Box component="form" autoComplete="off">
                      <Controller
                        name="password"
                        control={controlPassword}
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
                            label="Old password"
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
                        name="new_password"
                        control={controlPassword}
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
                            label="New password"
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
                      {alertPassword && <Alert severity={alert.type} sx={{ textAlign: 'left', my: 1 }}>{alertPassword.message}</Alert>}
                      <LoadingButton
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        endIcon={<Publish />}
                        loading={loadingChangePassword}
                        loadingPosition="end"
                        sx={{
                          marginTop: 3,
                          maxWidth: {
                            xs: 125,
                            sm: 175,
                          },
                          borderRadius: 3,
                          textTransform: 'none',
                          fontFamily: styles.font_poppins,
                          fontSize: {
                            xs: styles.font_extra_small,
                            sm: styles.font_medium,
                          },
                        }}
                        onClick={handleSubmitPassword(handleOnSubmitPassword)}
                      >
                        <span>Change</span>
                      </LoadingButton>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </div>
    </>
  );
};

export default Settings;
