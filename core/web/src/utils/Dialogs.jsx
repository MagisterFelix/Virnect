import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  IconButton,
  InputAdornment,
  LinearProgress,
  Link,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';

import {
  LoadingButton,
} from '@mui/lab';

import {
  Close,
  Image,
  Key,
  People,
  Title,
} from '@mui/icons-material';

import useAxios from '@api/axios';
import ENDPOINTS from '@api/endpoints';
import handleErrors from '@api/errors';

import { useAdmin } from '@providers/AdminProvider';
import { useRoomList } from '@providers/RoomDataProvider';

import EnhancedTable from '@utils/Tables';

import styles from '@styles/_globals.scss';

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

const UserDialog = ({ open, close, instance }) => {
  const { refetchUsers } = useAdmin();

  const [user, setUser] = useState(instance);

  useEffect(() => {
    setUser(user);
  }, [user]);

  const [{ loading }, execute] = useAxios(
    {
      method: 'PATCH',
    },
    {
      manual: true,
    },
  );

  const [alert, setAlert] = useState(null);

  const { control, handleSubmit, reset } = useForm();

  useEffect(() => {
    setAlert(null);
    reset();
  }, [open]);

  const handleOnSave = async (data) => {
    const formData = Object.entries(data).filter((entry) => (user[`${entry[0]}`]) !== entry[1]);
    if (formData.length === 0) {
      setAlert({ type: 'info', message: 'Nothing to update.' });
    } else {
      setAlert(null);
      const response = await execute({
        url: `${ENDPOINTS.user}${user.username}/`,
        data: Object.fromEntries(formData),
      });
      await refetchUsers();
      setUser({ ...user, ...response.data.user });
      reset({ ...response.data.user });
      setAlert({ type: 'success', message: response.data.details });
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
          <span>User Editing</span>
          <IconButton onClick={close} sx={{ mr: -1 }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Controller
            name="is_active"
            control={control}
            defaultValue={user.is_active}
            render={({
              field: { onChange, value },
            }) => (
              <FormControlLabel
                label="Active"
                control={(
                  <Checkbox
                    onChange={onChange}
                    checked={value}
                    disabled={user.is_superuser}
                  />
                )}
              />
            )}
          />
          <Controller
            name="is_staff"
            control={control}
            defaultValue={user.is_staff}
            render={({
              field: { onChange, value },
            }) => (
              <FormControlLabel
                label="Staff"
                control={(
                  <Checkbox
                    onChange={onChange}
                    checked={value}
                    disabled={user.is_superuser}
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
            onClick={handleSubmit(handleOnSave)}
          >
            <span>Save</span>
          </LoadingButton>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

const ReportDialog = ({ open, close, instance }) => {
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

  const [{ loading }, sendReport] = useAxios(
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
      accused: instance.id,
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
                      maxHeight: 340,
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
            loading={loading}
            onClick={handleSubmit(handleOnSubmit)}
          >
            <span>Send</span>
          </LoadingButton>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

const ReviewDialog = ({ open, close, instance }) => {
  const {
    loadingReportOptions, reportOptions, refetchReports, refetchUsers,
  } = useAdmin();

  const [report, setReport] = useState(instance);

  useEffect(() => {
    setReport(report);
  }, [report]);

  const [{ loading: loadingReportDetail, data: reportDetail }, refetchReportDetail] = useAxios(
    {
      url: `${ENDPOINTS.report}${report.id}/`,
      method: 'GET',
    },
  );

  const validation = {
    verdict: {
      validate: 'Verdict must be provided.',
    },
  };

  const [{ loading }, execute] = useAxios(
    {
      url: `${ENDPOINTS.report}${report.id}/`,
      method: 'PATCH',
    },
    {
      manual: true,
    },
  );

  const [alert, setAlert] = useState(null);

  const { control, handleSubmit, watch } = useForm();

  useEffect(() => {
    setAlert(null);
  }, [open]);

  const handleOnSave = async (form) => {
    setAlert(null);
    try {
      const response = await execute({
        data: form,
      });
      await refetchReports();
      await refetchUsers();
      setAlert({ type: 'success', message: response.data.details });
    } catch (err) {
      setAlert({ type: 'error', message: err.response.data.details });
    }
  };

  return (
    <Dialog
      fullWidth
      maxWidth="lg"
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
          <span>Review</span>
          <IconButton onClick={close} sx={{ mr: -1 }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {loadingReportDetail
            ? (
              <Box
                sx={{
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CircularProgress />
              </Box>
            ) : (
              <Box mb={2}>
                <Typography
                  sx={{
                    my: 1,
                    fontSize: styles.font_small,
                  }}
                >
                  <span>Profile:</span>
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Link
                    href={`/user/${reportDetail.accused.username}`}
                    underline="none"
                    sx={{ mr: 2 }}
                  >
                    <Avatar
                      alt={reportDetail.accused.username}
                      src={reportDetail.accused.image}
                      sx={{
                        height: 64,
                        width: 64,
                        outline: `2px solid ${styles.color_black}`,
                      }}
                    />
                  </Link>
                  <Typography
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <span>
                      Username:
                      {' '}
                      {reportDetail.accused.username}
                    </span>
                    {reportDetail.accused.full_name && (
                    <span>
                      Full name:
                      {' '}
                      {reportDetail.accused.full_name }
                    </span>
                    )}
                  </Typography>
                </Box>
                {reportDetail.accused.rooms.length !== 0 && (
                  <Box sx={{ my: 2 }}>
                    <EnhancedTable
                      variant="outlined"
                      rowsPerPage={5}
                      title="Room"
                      fields={[
                        { id: 'id', label: 'ID', type: 'integer' },
                        { id: 'title', label: 'Title', type: 'string' },
                        { id: 'tags', label: 'Tags', type: 'array' },
                      ]}
                      initialData={reportDetail.accused.rooms.map((room) => ({
                        id: room.id,
                        title: room.title,
                        tags: room.tags,
                      }))}
                      endpoint={ENDPOINTS.room}
                      refetchData={refetchReportDetail}
                      searchBy="title"
                    />
                  </Box>
                )}
                {reportDetail.accused.messages.length !== 0 && (
                <Box sx={{ my: 2 }}>
                  <EnhancedTable
                    variant="outlined"
                    rowsPerPage={5}
                    title="Message"
                    fields={[
                      { id: 'id', label: 'ID', type: 'integer' },
                      { id: 'text', label: 'Text', type: 'string' },
                    ]}
                    initialData={reportDetail.accused.messages.map((message) => ({
                      id: message.id,
                      text: message.text,
                    }))}
                    endpoint={ENDPOINTS.message}
                    refetchData={refetchReportDetail}
                    searchBy="text"
                  />
                </Box>
                )}
              </Box>
            )}
          <TextField
            value={report.reason}
            disabled
            fullWidth
            margin="dense"
            label="Reason"
            SelectProps={{
              MenuProps: {
                style: {
                  maxHeight: 340,
                },
              },
            }}
          />
          <Controller
            name="verdict"
            control={control}
            defaultValue={report.verdict[0]}
            rules={{
              validate: (verdict) => verdict !== 0 || watch('is_viewed'),
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
                disabled={report.reviewed_by !== undefined}
                margin="dense"
                label="Verdict"
                SelectProps={{
                  MenuProps: {
                    style: {
                      maxHeight: 340,
                    },
                  },
                }}
                error={fieldError !== undefined}
                helperText={fieldError ? fieldError.message || validation.verdict[fieldError.type] : ''}
              >
                {
                    loadingReportOptions
                      ? (<LinearProgress sx={{ m: 2 }} />)
                      : (
                        reportOptions.actions.POST.verdict.choices.map(
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
          <Controller
            name="is_viewed"
            control={control}
            defaultValue={report.is_viewed}
            render={({
              field: { onChange, value },
            }) => (
              <FormControlLabel
                label="Viewed"
                control={(
                  <Checkbox
                    onChange={onChange}
                    checked={value || watch('verdict') !== 0}
                    disabled={report.reviewed_by !== undefined || watch('verdict') !== 0}
                  />
                )}
              />
            )}
          />
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'end',
            }}
          >
            <Typography
              sx={{
                my: 1,
              }}
            >
              <span>
                <em>{new Date(report.created_at).toLocaleString('en-GB')}</em>
              </span>
            </Typography>
          </Box>
          {alert && <Alert severity={alert.type} sx={{ textAlign: 'left', mt: 1 }}>{alert.message}</Alert>}
        </DialogContent>
        <DialogActions sx={{ mx: 1 }}>
          <LoadingButton
            loading={loading}
            disabled={report.reviewed_by !== undefined}
            onClick={handleSubmit(handleOnSave)}
          >
            <span>Save</span>
          </LoadingButton>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

const TopicDialog = ({ open, close, instance }) => {
  const { refetchTopics, refetchRooms } = useAdmin();

  const [topic, setTopic] = useState(instance);

  useEffect(() => {
    setTopic(topic);
  }, [topic]);

  const validation = {
    title: {
      required: 'This field may not be blank.',
      maxLength: 'No more than 64 characters.',
    },
    description: {
      required: 'This field may not be blank.',
      maxLength: 'No more than 256 characters.',
    },
    image: {
      required: 'This field may not be blank.',
    },
  };

  const [{ loading }, execute] = useAxios(
    {
      url: ENDPOINTS.topics,
    },
    {
      manual: true,
    },
  );

  const [alert, setAlert] = useState(null);

  const {
    control, handleSubmit, setError, reset,
  } = useForm();

  useEffect(() => {
    setAlert(null);
    reset();
  }, [open]);

  const handleOnSubmit = async (formData) => {
    setAlert(null);
    try {
      const response = await execute({
        method: 'POST',
        data: formData,
      });
      await refetchTopics();
      setAlert({ type: 'success', message: response.data.details });
    } catch (err) {
      handleErrors(validation, err.response.data.details, setError, setAlert);
    }
  };
  const handleOnEdit = async (data) => {
    const formData = Object.entries(data).filter((entry) => topic[`${entry[0]}`] !== entry[1]);
    if (formData.length === 0) {
      setAlert({ type: 'info', message: 'Nothing to update.' });
    } else {
      setAlert(null);
      try {
        const response = await execute({
          method: 'PATCH',
          url: `${ENDPOINTS.topic}${topic.id}/`,
          data: Object.fromEntries(formData),
        });
        const responseTopics = await refetchTopics();
        responseTopics.data.find((topicData) => topicData.id === topic.id).image += `?dt=${new Date().getTime()}`;
        setTopic(response.data.topic);
        reset(response.data.topic);
        await refetchRooms();
        setAlert({ type: 'success', message: response.data.details });
      } catch (err) {
        handleErrors(validation, err.response.data.details, setError, setAlert);
      }
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
          <span>{topic ? 'Topic Editing' : 'Topic Creation'}</span>
          <IconButton onClick={close} sx={{ mr: -1 }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Controller
            name="title"
            control={control}
            defaultValue={topic ? topic.title : ''}
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
                error={fieldError !== undefined}
                helperText={fieldError ? fieldError.message || validation.title[fieldError.type] : ''}
              />
            )}
          />
          <Controller
            name="description"
            control={control}
            defaultValue={topic ? topic.description : ''}
            rules={{
              required: true,
              maxLength: 256,
            }}
            render={({
              field: { onChange, value },
              fieldState: { error: fieldError },
            }) => (
              <TextField
                onChange={onChange}
                value={value}
                fullWidth
                multiline
                margin="dense"
                type="text"
                label="Description"
                minRows={4}
                error={fieldError !== undefined}
                helperText={fieldError ? fieldError.message || validation.description[fieldError.type] : ''}
              />
            )}
          />
          <Controller
            name="image"
            control={control}
            defaultValue={topic ? topic.image : undefined}
            rules={{
              required: true,
            }}
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
                  startAdornment: (
                    <InputAdornment position="start">
                      <Image />
                    </InputAdornment>
                  ),
                }}
                error={fieldError !== undefined}
                helperText={fieldError ? fieldError.message || validation.image[fieldError.type] : ''}
              />
            )}
          />
          {alert && <Alert severity={alert.type} sx={{ textAlign: 'left', mt: 1 }}>{alert.message}</Alert>}
        </DialogContent>
        <DialogActions sx={{ mx: 1 }}>
          <LoadingButton
            loading={loading}
            onClick={handleSubmit(topic ? handleOnEdit : handleOnSubmit)}
          >
            <span>{topic ? 'Edit' : 'Create'}</span>
          </LoadingButton>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

const RoomDialog = ({ open, close, instance }) => {
  const [room, setRoom] = useState(instance);

  useEffect(() => {
    setRoom(room);
  }, [room]);

  const {
    loading, loadingTopicList, topicList, loadingRoomOptions, roomOptions, createRoom, updateRoom,
  } = useRoomList();

  const validation = {
    title: {
      required: 'This field may not be blank.',
      maxLength: 'No more than 64 characters.',
      pattern: 'Provide the valid title.',
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

  const [alert, setAlert] = useState(null);

  const {
    control, handleSubmit, setError, reset,
  } = useForm();

  useEffect(() => {
    setAlert(null);
    if (open && instance) {
      setRoom(instance);
      reset({
        title: instance.title,
        topic: instance.topic.id,
        language: instance.language,
        number_of_participants: instance.number_of_participants,
        key: instance.key,
        tags: instance.tags.map((tag) => tag.name),
      });
    }
  }, [open]);

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
          <span>{room ? 'Room Editing' : 'Room Creation'}</span>
          <IconButton onClick={close} sx={{ mr: -1 }}>
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
              pattern: /^[^/]*$/,
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
  UserDialog,
  ReportDialog,
  ReviewDialog,
  TopicDialog,
  RoomDialog,
};
