import React from 'react';

import {
  Container,
} from '@mui/material';

import Panel from '@components/main/Panel';
import RoomList from '@components/main/RoomList';
import Navbar from '@components/navbar/Navbar';

const Home = () => (
  <>
    <Navbar />
    <Container>
      <Panel />
      <RoomList />
    </Container>
  </>
);

export default Home;
