import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

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

import {
  AccessTime,
  Close,
  Edit,
  Lock,
  Tag,
} from '@mui/icons-material';

import { useAuth } from '@context/AuthProvider';
import { useRoom } from '@context/RoomProvider';

import { ConfirmationForm, RoomForm } from '@utils/Forms';
import { LightTooltip } from '@utils/Styles';
import getFormattedTime from '@utils/Time';

import styles from '@styles/_globals.scss';

import './Main.scss';

const RoomList = ({ editable }) => {
  const { profile } = useAuth();

  const isUnderMd = useMediaQuery((theme) => theme.breakpoints.down('md'));

  const {
    loadingRoomData: loadingRooms, roomData: rooms, error, deleteRoom,
  } = useRoom();

  const [selectedRoom, setSelectedRoom] = useState(null);

  const handleOpenTooltip = (room) => setSelectedRoom(room);
  const handleCloseToolTip = () => setSelectedRoom(null);

  const validationKey = {
    key: {
      required: 'This field may not be blank.',
    },
  };

  const [alertKey, setAlertKey] = useState(null);
  const { control: controlKey, handleSubmit: handleSubmitKey, reset: resetKey } = useForm();
  const handleOnSubmitKey = (form) => {
    setAlertKey(null);
    crypto.subtle.digest('SHA-256', new TextEncoder().encode(form.key))
      .then((hashBuffer) => {
        if (!Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, '0')).join('') === selectedRoom.key) {
          setAlertKey({ type: 'error', message: 'Key mismatch.' });
        }
      });
  };

  const [openVerificationDialog, setOpenVerificationDialog] = useState(false);
  const handleOpenVerificationDialog = (room) => {
    setSelectedRoom(room);
    resetKey();
    setAlertKey(null);
    setOpenVerificationDialog(true);
  };
  const handleCloseVerificationDialog = () => setOpenVerificationDialog(false);

  const handleOnJoin = (room) => {
    if (room.key.length !== 0 && profile.id !== room.host.id) {
      handleOpenVerificationDialog(room);
    }
  };

  const [alertRoomEditing, setAlertRoomEditing] = useState(null);
  const formRoomEditing = useForm();

  const [openRoomEditingDialog, setOpenRoomEditingDialog] = useState(false);
  const handleOpenRoomEditingDialog = (room) => {
    setSelectedRoom(room);
    formRoomEditing.reset();
    setAlertRoomEditing(null);
    setOpenRoomEditingDialog(true);
  };

  const handleOnDelete = async (room) => {
    await deleteRoom(room);
  };

  if (!loadingRooms && rooms.results.length === 0) {
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
          <span>{error}</span>
        </Typography>
      </div>
    );
  }

  return (
    <div className="Rooms">
      {loadingRooms
        ? (
          <>
            <Skeleton variant="rounded" height={270} sx={{ mt: 4, borderRadius: 2 }} />
            <Skeleton variant="rounded" height={270} sx={{ my: 4, borderRadius: 2 }} />
          </>
        ) : rooms.results.map(
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
                  <Grid item xs={11} md={6}>
                    <Typography
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
                    md={6}
                    sx={{
                      display: 'flex',
                      justifyContent: 'end',
                    }}
                  >
                    {isUnderMd ? room.tags.length !== 0 && (
                      <IconButton
                        onClick={() => handleOpenTooltip(room)}
                        sx={{
                          mt: -1,
                          mr: -1,
                          color: styles.color_white,
                        }}
                      >
                        <LightTooltip
                          title={room.tags.map((tag) => tag.name).join(', ')}
                          placement="top"
                          disableFocusListener
                          disableTouchListener
                          open={selectedRoom === room}
                          onClose={handleCloseToolTip}
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
                    <Typography>
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
                        disabled={room.number_of_participants === room.participants.length}
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
                      <ConfirmationForm onConfirm={() => handleOnDelete(room)} />
                      )}
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
            control={controlKey}
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
                helperText={fieldError ? fieldError.message || validationKey.key[fieldError.type] : ''}
              />
            )}
          />
          {alertKey && <Alert severity={alertKey.type} sx={{ textAlign: 'left', mt: 1 }}>{alertKey.message}</Alert>}
        </DialogContent>
        <DialogActions sx={{ mx: 1 }}>
          <Button onClick={handleSubmitKey(handleOnSubmitKey)}>
            <span>Try</span>
          </Button>
        </DialogActions>
      </Dialog>
      {editable && selectedRoom && (
      <RoomForm
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
