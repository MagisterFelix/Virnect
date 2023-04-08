import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  Container,
} from '@mui/material';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';

import Panel from '@components/main/Panel';
import RoomList from '@components/main/RoomList';
import Navbar from '@components/navbar/Navbar';

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state !== null && location.state.notification !== undefined) {
      const { type, message } = location.state.notification;
      toast(message, { type });
      navigate(location.pathname, { replace: true });
    }
  }, []);

  return (
    <>
      <Navbar />
      <ToastContainer position="top-left" style={{ marginTop: '6.5em' }} />
      <Container>
        <Panel />
        <RoomList />
      </Container>
    </>
  );
};

export default Home;
