import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  InputAdornment,
  LinearProgress,
  MenuItem,
  TextField,
} from '@mui/material';

import { LoadingButton } from '@mui/lab';

import {
  Close,
  Key,
  People,
  Title,
} from '@mui/icons-material';

import useAxios from '@api/axios';
import ENDPOINTS from '@api/endpoints';

import { useRoomData } from '@context/RoomDataProvider';

const ConfirmationDialog = ({
  open, close, message, onConfirm,
}) => (
  <Dialog fullWidth open={open} onClose={close}>
    <DialogTitle>
      <span>Confirmation</span>
    </DialogTitle>
    <DialogContent>
      <DialogContentText>
        <span>{message}</span>
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button variant="text" onClick={close}>no</Button>
      <Button variant="text" onClick={() => { onConfirm(); close(); }}>yes</Button>
    </DialogActions>
  </Dialog>
);

const ReportDialog = ({ open, close, user }) => {
  const [{ loading: loadingReportOptions, data: reportOptions }] = useAxios(
    {
      url: ENDPOINTS.reports,
      method: 'OPTIONS',
    },
  );

  const validation = {
    reason: {
      required: 'This field may not be blank.',
    },
  };

  const [{ loading: loadingReport }, sendReport] = useAxios(
    {
      url: ENDPOINTS.reports,
      method: 'POST',
    },
    {
      manual: true,
    },
  );

  const [alert, setAlert] = useState(null);
  const { control, handleSubmit } = useForm();
  const handleOnSubmit = async (form) => {
    const formData = {
      accused: user.id,
      ...form,
    };
    setAlert(null);
    try {
      const response = await sendReport({
        data: formData,
      });
      setAlert({ type: 'success', message: response.data.details });
    } catch (err) {
      setAlert({ type: 'error', message: err.response.data.details });
    }
  };

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={close}
    >
      <Box component="form" autoComplete="off">
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>Report</span>
          <IconButton onClick={close} sx={{ mr: -1 }}>
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
                SelectProps={{
                  MenuProps: {
                    style: {
                      maxHeight: 300,
                    },
                  },
                }}
                error={fieldError !== undefined}
                helperText={fieldError ? fieldError.message || validation.reason[fieldError.type] : ''}
              >
                {
                    loadingReportOptions
                      ? (<LinearProgress sx={{ m: 2 }} />)
                      : (
                        reportOptions.actions.POST.reason.choices.map(
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
        <DialogActions sx={{ mx: 1 }}>
          <LoadingButton
            loading={loadingReport}
            onClick={handleSubmit(handleOnSubmit)}
          >
            <span>Send</span>
          </LoadingButton>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

const RoomDialog = ({
  instance, form, alert, setAlert, openDialog, setOpenDialog,
}) => {
  const [room, setRoom] = useState(instance);

  useEffect(() => {
    setRoom(room);
  }, [room]);

  const {
    loading, loadingTopicList, topicList, loadingRoomOptions, roomOptions, createRoom, updateRoom,
  } = useRoomData();

  const validation = {
    title: {
      required: 'This field may not be blank.',
      maxLength: 'No more than 64 characters.',
    },
    topic: {
      required: 'This field may not be blank.',
    },
    language: {
      required: 'This field may not be blank.',
    },
    number_of_participants: {
      required: 'This field may not be blank.',
      min: 'Value must be greater than 1.',
      max: 'Value must be less than 11.',
    },
    key: {
      maxLength: 'No more than 16 characters.',
    },
  };

  const {
    control, handleSubmit, setError, reset,
  } = form;
  const handleOnSubmit = async (formData) => {
    await createRoom(formData, validation, setError, setAlert);
  };
  const handleOnEdit = (data) => {
    const formData = Object.entries(data).filter((entry) => {
      if (entry[0] === 'topic') {
        return room[`${entry[0]}`].id !== entry[1];
      }
      if (entry[0] === 'tags') {
        return JSON.stringify(room[`${entry[0]}`].map((tag) => tag.name)) !== JSON.stringify(entry[1]);
      }
      return room[`${entry[0]}`] !== entry[1];
    });
    if (formData.length === 0) {
      setAlert({ type: 'info', message: 'Nothing to update.' });
    } else {
      updateRoom(
        room,
        Object.fromEntries(formData),
        validation,
        setError,
        setAlert,
        setRoom,
        reset,
      );
    }
  };

  const [tagsError, setTagsError] = useState(null);

  const handleCloseDialog = () => setOpenDialog(false);

  return (
    <Dialog
      fullWidth
      open={openDialog}
      onClose={handleCloseDialog}
    >
      <Box component="form" autoComplete="off">
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{room ? 'Room Editing' : 'Room Creation'}</span>
          <IconButton onClick={handleCloseDialog} sx={{ mr: -1 }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Controller
            name="title"
            control={control}
            defaultValue={room ? room.title : ''}
            rules={{
              required: true,
              maxLength: 64,
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
                label="Title"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Title />
                    </InputAdornment>
                  ),
                }}
                error={fieldError !== undefined}
                helperText={fieldError ? fieldError.message || validation.title[fieldError.type] : ''}
              />
            )}
          />
          <Controller
            name="topic"
            control={control}
            defaultValue={room ? room.topic.id : ''}
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
                label="Topic"
                SelectProps={{
                  MenuProps: {
                    style: {
                      maxHeight: 300,
                    },
                  },
                }}
                error={fieldError !== undefined}
                helperText={fieldError ? fieldError.message || validation.topic[fieldError.type] : ''}
              >
                {loadingTopicList
                  ? (<LinearProgress sx={{ m: 2 }} />)
                  : (
                    topicList.map(
                      (topic) => (
                        <MenuItem key={topic.id} value={topic.id}>
                          {topic.title}
                        </MenuItem>
                      ),
                    ))}
              </TextField>
            )}
          />
          <Controller
            name="language"
            control={control}
            defaultValue={room ? room.language : ''}
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
                label="Language"
                SelectProps={{
                  MenuProps: {
                    style: {
                      maxHeight: 300,
                    },
                  },
                }}
                error={fieldError !== undefined}
                helperText={fieldError ? fieldError.message || validation.language[fieldError.type] : ''}
              >
                {loadingRoomOptions
                  ? (<LinearProgress sx={{ m: 2 }} />)
                  : (
                    roomOptions.actions.POST.language.choices.map(
                      (language) => (
                        <MenuItem key={language.value} value={language.value}>
                          {language.display_name}
                        </MenuItem>
                      ),
                    ))}
              </TextField>
            )}
          />
          <Controller
            name="number_of_participants"
            control={control}
            defaultValue={room ? room.number_of_participants : 10}
            rules={{
              required: true,
              min: 2,
              max: 10,
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
                type="number"
                label="Max number of participants"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <People />
                    </InputAdornment>
                  ),
                }}
                error={fieldError !== undefined}
                helperText={fieldError ? fieldError.message || validation.number_of_participants[fieldError.type] : ''}
              />
            )}
          />
          <Controller
            name="key"
            control={control}
            defaultValue={room ? room.key : ''}
            rules={{
              maxLength: 16,
            }}
            render={({
              field: { onChange, value },
              fieldState: { error: fieldError },
            }) => (
              <TextField
                onChange={onChange}
                value={value}
                fullWidth
                margin="dense"
                type="text"
                label="Key"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Key />
                    </InputAdornment>
                  ),
                }}
                error={fieldError !== undefined}
                helperText={fieldError ? fieldError.message || validation.key[fieldError.type] : ''}
              />
            )}
          />
          <Controller
            name="tags"
            control={control}
            defaultValue={room ? room.tags.map((tag) => tag.name) : []}
            render={({
              field: { onChange, value },
            }) => (
              <Autocomplete
                multiple
                freeSolo
                options={[]}
                value={value}
                onChange={(event, newValue) => {
                  if (event.target.value && event.target.value.length > 16) {
                    setTagsError('No more than 16 characters.');
                  } else if (newValue.length === 6) {
                    setTagsError('Room cannot has more than 5 tags.');
                  } else {
                    setTagsError(null);
                    onChange(newValue);
                  }
                }}
                renderTags={(val, getTagProps) => val.map((option, index) => (
                  <Chip
                    label={option}
                    {...getTagProps({ index })}
                  />
                ))}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tags"
                    margin="dense"
                    error={tagsError !== null}
                    helperText={tagsError}
                  />
                )}
              />
            )}
          />
          {alert && <Alert severity={alert.type} sx={{ textAlign: 'left', mt: 1 }}>{alert.message}</Alert>}
        </DialogContent>
        <DialogActions sx={{ mx: 1 }}>
          <LoadingButton
            loading={loading}
            onClick={handleSubmit(room ? handleOnEdit : handleOnSubmit)}
          >
            <span>{room ? 'Edit' : 'Create'}</span>
          </LoadingButton>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export {
  ConfirmationDialog,
  ReportDialog,
  RoomDialog,
};
