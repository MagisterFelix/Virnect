import React from 'react';

import {
  Container,
} from '@mui/material';

import FilterBar from '@components/main/FilterBar';
import Navbar from '@components/navbar/Navbar';

const Home = () => (
  <>
    <Navbar />
    <Container>
      <FilterBar />
    </Container>
  </>
);

export default Home;
