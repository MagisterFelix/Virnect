import React from 'react';

import {
  Avatar,
  Box,
  Button,
  Fab,
  Paper,
} from '@mui/material';

import {
  Call,
  CallEnd,
  Mic,
  MicOff,
} from '@mui/icons-material';

import { useAuth } from '@providers/AuthProvider';
import { useRoom } from '@providers/RoomDataProvider';

import styles from '@styles/_globals.scss';

const VoiceChat = () => {
  const { profile } = useAuth();

  const {
    voiceChatUsers, isMuted, connectToVoiceChat, toggleMic, disconnectFromVoiceChat,
  } = useRoom();

  return (
    <div className="VoiceChat">
      <Paper
        sx={{
          p: {
            xs: 1,
            sm: 2,
          },
          bgcolor: styles.color_soft_dark,
          color: styles.color_white,
          borderRadius: 2,
          height: '25dvh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            height: '100%',
          }}
        >
          {voiceChatUsers.length !== 0 ? (
            voiceChatUsers.map((user) => (
              <Avatar
                key={user.id}
                alt={user.username}
                src={user.image}
                sx={{
                  m: 0.5,
                  height: {
                    xs: 50,
                    sm: 64,
                    xl: 74,
                  },
                  width: {
                    xs: 50,
                    sm: 64,
                    xl: 74,
                  },
                }}
              />
            ))
          ) : (
            <Box
              component="img"
              src="/static/empty.gif"
              alt="empty"
              width="10em"
            />
          )}
        </Box>
        {voiceChatUsers.findIndex((user) => user.id === profile.id) === -1
          ? (
            <Box
              sx={{
                p: 1,
                m: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Button
                variant="contained"
                endIcon={<Call />}
                onClick={connectToVoiceChat}
                sx={{
                  textTransform: 'none',
                  borderRadius: 5,
                }}
              >
                <span>Connect</span>
              </Button>
            </Box>
          ) : (
            <Box
              sx={{
                p: 1,
                my: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Fab
                color={isMuted ? 'error' : 'default'}
                size="small"
                onClick={toggleMic}
                sx={{ mx: 1 }}
              >
                {isMuted ? <MicOff /> : <Mic />}
              </Fab>
              <Fab
                color="error"
                size="small"
                onClick={disconnectFromVoiceChat}
                sx={{ mx: 1 }}
              >
                <CallEnd />
              </Fab>
            </Box>
          )}
      </Paper>
    </div>
  );
};

export default VoiceChat;
