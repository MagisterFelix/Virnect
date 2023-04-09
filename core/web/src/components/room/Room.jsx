import React from 'react';
import { useBeforeUnload } from 'react-router-dom';

import { useConnection } from '@context/ConnectionProvider';

import Navbar from '@components/navbar/Navbar';

const Room = () => {
  const { disconnect } = useConnection();

  useBeforeUnload(() => {
    const room = sessionStorage.getItem('room');
    if (room !== null) {
      disconnect(room);
    }
  });

  return (<Navbar />);
};

export default Room;
