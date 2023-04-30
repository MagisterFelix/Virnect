import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  Container,
} from '@mui/material';

import { toast } from 'react-toastify';

import { useRoomList } from '@providers/RoomDataProvider';

import Panel from '@components/main/Panel';
import RoomList from '@components/main/RoomList';

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { refetchRoomList } = useRoomList();
  const updateRoomList = async () => {
    await refetchRoomList();
  };

  useEffect(() => {
    if (location.state && location.state.toast !== undefined) {
      const { type, message } = location.state.toast;
      toast(message, { type });
      navigate(location.pathname, { replace: true });
      updateRoomList();
    }
  }, [location.state]);

  return (
    <div className="Home">
      <Container>
        <Panel />
        <RoomList />
      </Container>
    </div>
  );
};

export default Home;
