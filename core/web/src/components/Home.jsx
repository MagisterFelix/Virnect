import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  Container,
} from '@mui/material';

import { toast } from 'react-toastify';

import Panel from '@components/main/Panel';
import RoomList from '@components/main/RoomList';
import Navbar from '@components/navbar/Navbar';

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state && location.state.toast !== undefined) {
      const { type, message } = location.state.toast;
      toast(message, { type });
      navigate(location.pathname, { replace: true });
    }
  }, [location.state]);

  return (
    <>
      <Navbar />
      <Container>
        <Panel />
        <RoomList />
      </Container>
    </>
  );
};

export default Home;
