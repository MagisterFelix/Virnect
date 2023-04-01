import React from 'react';

import {
  Container,
} from '@mui/material';

import Navbar from '@components/navbar/Navbar';
import Topic from '@components/topic/Topic';

import './Home.scss';

const Home = () => (
  <>
    <Navbar />
    <Container>
      <Topic />
    </Container>
  </>
);

export default Home;
