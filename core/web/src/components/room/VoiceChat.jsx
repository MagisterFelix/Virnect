import React from 'react';

import {
  Avatar,
  Badge,
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
              <Badge
                key={user.id}
                overlap="circular"
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                badgeContent={
                  user.is_muted
                    ? (
                      <MicOff
                        sx={{
                          p: {
                            xs: 0.1,
                            sm: 0.25,
                          },
                          bgcolor: styles.color_red,
                          borderRadius: 5,
                          border: `3px solid ${styles.color_soft_dark}`,
                          fontSize: {
                            xs: styles.font_extra_small,
                            sm: styles.font_small,
                          },
                        }}
                      />
                    ) : null
                }
              >
                <Avatar
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
                    outline: user.is_speaking ? `2px solid ${styles.color_green}` : 'none',
                    outlineOffset: user.is_speaking ? 1 : 'none',
                  }}
                />
              </Badge>
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
