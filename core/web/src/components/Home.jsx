import React from 'react';

import {
  Container,
} from '@mui/material';

import Panel from '@components/main/Panel';
import Navbar from '@components/navbar/Navbar';

const Home = () => (
  <>
    <Navbar />
    <Container>
      <Panel />
    </Container>
  </>
);

export default Home;
