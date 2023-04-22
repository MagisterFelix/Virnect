import React from 'react';

import {
  Container,
  Grid,
} from '@mui/material';

import Chat from '@components/room/Chat';
import Participants from '@components/room/Participants';
import VoiceChat from '@components/room/VoiceChat';

import './Room.scss';

const Room = () => (
  <div className="Room">
    <Container maxWidth="xl" fixed>
      <Grid container spacing={4} mb={2}>
        <Grid item xs={12} lg={8.5}>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <VoiceChat />
            </Grid>
            <Grid item xs={12}>
              <Chat />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} lg={3.5}>
          <Participants />
        </Grid>
      </Grid>
    </Container>
  </div>
);

export default Room;
