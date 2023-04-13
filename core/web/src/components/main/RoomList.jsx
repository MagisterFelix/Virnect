import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import {
  Alert,
  Avatar,
  AvatarGroup,
  Box,
  Button,
  ButtonGroup,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Skeleton,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';

import { LoadingButton } from '@mui/lab';

import {
  AccessTime,
  Close,
  Delete,
  Edit,
  Lock,
  Tag,
} from '@mui/icons-material';

import { useAuth } from '@context/AuthProvider';
import { useRoomData } from '@context/RoomDataProvider';

import { ConfirmationDialog, RoomDialog } from '@utils/Dialogs';
import { LightTooltip } from '@utils/Styles';
import { getFormattedTime } from '@utils/Time';

import styles from '@styles/_globals.scss';

import './Main.scss';

const RoomList = ({ editable }) => {
  const navigate = useNavigate();

  const { profile } = useAuth();

  const isUnderMd = useMediaQuery((theme) => theme.breakpoints.down('md'));

  const {
    loading, loadingRoomList, roomList, notFound, deleteRoom, searchLoading,
  } = useRoomData();

  const [selectedRoom, setSelectedRoom] = useState(null);

  const handleOpenTooltip = (room) => setSelectedRoom(room);
  const handleCloseToolTip = () => setSelectedRoom(null);

  const validation = {
    key: {
      required: 'This field may not be blank.',
    },
  };

  const [alert, setAlert] = useState(null);
  const { control, handleSubmit, reset } = useForm();
  const handleOnConnect = (form) => {
    setAlert(null);
    crypto.subtle.digest('SHA-256', new TextEncoder().encode(form.key))
      .then((hashBuffer) => {
        if (Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, '0')).join('') !== selectedRoom.key) {
          setAlert({ type: 'error', message: 'Key mismatch.' });
        } else {
          navigate(`/room/${selectedRoom.title}`, { state: { key: form.key } });
        }
      });
  };

  const [openVerificationDialog, setOpenVerificationDialog] = useState(false);
  const handleOpenVerificationDialog = (room) => {
    setSelectedRoom(room);
    reset();
    setAlert(null);
    setOpenVerificationDialog(true);
  };
  const handleCloseVerificationDialog = () => setOpenVerificationDialog(false);

  const [alertRoomEditing, setAlertRoomEditing] = useState(null);
  const formRoomEditing = useForm();

  const [openRoomEditingDialog, setOpenRoomEditingDialog] = useState(false);
  const handleOpenRoomEditingDialog = (room) => {
    setSelectedRoom(room);
    formRoomEditing.reset();
    setAlertRoomEditing(null);
    setOpenRoomEditingDialog(true);
  };

  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
  const handleOpenConfirmationDialog = (room) => {
    setSelectedRoom(room);
    setOpenConfirmationDialog(true);
  };
  const handleOnDelete = async (room) => {
    await deleteRoom(room);
  };
  const handleCloseConfirmationDialog = () => setOpenConfirmationDialog(false);

  const handleOnJoin = (room) => {
    if (room.key.length !== 0 && profile.id !== room.host.id) {
      setSelectedRoom(room);
      handleOpenVerificationDialog(room);
    } else {
      navigate(`/room/${room.title}`);
    }
  };

  if (!loadingRoomList && (!roomList || roomList.results.length === 0)) {
    return (
      <div className="Nothing" style={{ textAlign: 'center' }}>
        <Box
          component="img"
          src="/static/nothing.svg"
          alt="empty"
          width={{ xs: '65%', sm: '55%', md: '35%' }}
        />
        <Typography sx={{
          my: 2,
          fontSize: styles.font_large,
          fontWeight: 'bold',
          color: styles.color_white,
        }}
        >
          <span>{notFound}</span>
        </Typography>
      </div>
    );
  }

  return (
    <div className="Rooms">
      {(loadingRoomList && !roomList) || searchLoading
        ? (
          <Skeleton variant="rounded" height={270} sx={{ mt: 4, borderRadius: 2 }} />
        ) : roomList.results.map(
          (room) => (
            <Paper
              key={room.id}
              sx={{
                my: 4,
                p: 2,
                bgcolor: styles.color_soft_dark,
                color: styles.color_white,
                borderRadius: 2,
              }}
            >
              <Grid container>
                <Grid container p={2}>
                  <Grid item xs={11} lg={6}>
                    <Typography
                      noWrap
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'start',
                      }}
                    >
                      <Box
                        component="img"
                        src={`https://flagcdn.com/${room.language.toLowerCase()}.svg`}
                        width={24}
                        sx={{ mr: 1.5 }}
                      />
                      <span>{getFormattedTime(room.created_at)}</span>
                      <AccessTime sx={{ ml: 1.5 }} />
                    </Typography>
                  </Grid>
                  <Grid
                    item
                    xs={1}
                    lg={6}
                    sx={{
                      display: 'flex',
                      justifyContent: 'end',
                    }}
                  >
                    {isUnderMd ? room.tags.length !== 0 && (
                      <IconButton
                        onClick={() => {
                          if (selectedRoom !== room) {
                            handleOpenTooltip(room);
                          } else {
                            handleCloseToolTip();
                          }
                        }}
                        sx={{
                          mt: -1,
                          mr: -1,
                          color: styles.color_white,
                        }}
                      >
                        <LightTooltip
                          title={room.tags.map((tag) => `#${tag.name}`).join(', ')}
                          placement="top"
                          disableFocusListener
                          disableTouchListener
                          open={selectedRoom === room}
                          onClose={handleCloseToolTip}
                          sx={{
                            maxWidth: '40%',
                            textAlign: 'center',
                          }}
                        >
                          <Tag />
                        </LightTooltip>
                      </IconButton>
                    ) : (
                      room.tags.length !== 0 && (
                        room.tags.map((tag) => (
                          <Chip
                            key={tag.id}
                            icon={<Tag />}
                            label={tag.name}
                            color="info"
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        ))
                      ))}
                  </Grid>
                </Grid>
                <Grid
                  container
                  px={2}
                  py={4}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Grid item xs={10}>
                    <Typography
                      noWrap
                      sx={{
                        fontSize: styles.font_medium,
                        fontWeight: 'bold',
                      }}
                    >
                      <span>{room.title}</span>
                    </Typography>
                  </Grid>
                  <Grid
                    item
                    xs={2}
                    sx={{
                      display: 'flex',
                      justifyContent: 'end',
                    }}
                  >
                    {room.participants.length !== 0 ? (
                      <LightTooltip
                        title={`${room.participants.length} / ${room.number_of_participants}`}
                        arrow
                        placement="top"
                        enterTouchDelay={0}
                      >
                        <AvatarGroup max={3} total={room.participants.length}>
                          {room.participants.map((participant) => (
                            <Avatar
                              key={participant.id}
                              src={participant.image}
                              alt={participant.username}
                            />
                          ))}
                        </AvatarGroup>
                      </LightTooltip>
                    ) : (
                      <Box
                        component="img"
                        src="/static/empty.gif"
                        alt="empty"
                        width="5em"
                      />
                    )}
                  </Grid>
                </Grid>
                <Grid container p={2}>
                  <Grid
                    item
                    xs={12}
                    md={9}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Box
                      component="img"
                      src={room.topic.image}
                      alt={room.topic.title}
                      pr={1}
                      sx={{
                        height: 36,
                        width: 36,
                      }}
                    />
                    <Typography noWrap>
                      <span>{room.topic.title}</span>
                    </Typography>
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    md={3}
                    textAlign="right"
                    sx={{
                      mt: {
                        xs: 3,
                        md: 0,
                      },
                    }}
                  >
                    <ButtonGroup variant="contained" sx={{ minWidth: editable ? 150 : 100 }}>
                      <Button
                        disabled={room.number_of_participants === room.participants.length
                           || room.participants.map((user) => user.id).includes(profile.id)}
                        onClick={() => handleOnJoin(room)}
                        endIcon={room.key.length !== 0 && profile.id !== room.host.id && <Lock />}
                        sx={{
                          width: '100%',
                          textTransform: 'none',
                          fontSize: styles.font_extra_small,
                        }}
                      >
                        <span>Join</span>
                      </Button>
                      {editable && (
                      <Button onClick={() => handleOpenRoomEditingDialog(room)}>
                        <Edit fontSize="small" />
                      </Button>
                      )}
                      {editable && (
                      <Button onClick={() => handleOpenConfirmationDialog(room)}>
                        <Delete fontSize="small" />
                      </Button>
                      )}
                      <ConfirmationDialog
                        open={openConfirmationDialog}
                        close={handleCloseConfirmationDialog}
                        message={`Are you sure you want to delete the «${selectedRoom && selectedRoom.title}» room?`}
                        onConfirm={() => handleOnDelete(selectedRoom)}
                      />
                    </ButtonGroup>
                  </Grid>
                </Grid>
              </Grid>
            </Paper>
          ),
        )}
      <Dialog
        fullWidth
        open={openVerificationDialog}
        onClose={handleCloseVerificationDialog}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>Verification</span>
          <IconButton onClick={handleCloseVerificationDialog} sx={{ mr: -1 }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Controller
            name="key"
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
                margin="dense"
                label="Key"
                error={fieldError !== undefined}
                helperText={fieldError ? fieldError.message || validation.key[fieldError.type] : ''}
              />
            )}
          />
          {alert && <Alert severity={alert.type} sx={{ textAlign: 'left', mt: 1 }}>{alert.message}</Alert>}
        </DialogContent>
        <DialogActions sx={{ mx: 1 }}>
          <LoadingButton
            loading={loading}
            onClick={handleSubmit(handleOnConnect)}
          >
            <span>Try</span>
          </LoadingButton>
        </DialogActions>
      </Dialog>
      {editable && selectedRoom && (
      <RoomDialog
        instance={selectedRoom}
        form={formRoomEditing}
        alert={alertRoomEditing}
        setAlert={setAlertRoomEditing}
        openDialog={openRoomEditingDialog}
        setOpenDialog={setOpenRoomEditingDialog}
      />
      )}
    </div>
  );
};

export default RoomList;
