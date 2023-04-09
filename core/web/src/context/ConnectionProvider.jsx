import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import useAxios from '@api/axios';
import ENDPOINTS from '@api/endpoints';
import handleErrors from '@api/errors';

const ConnectionContext = createContext(null);

const useConnection = () => useContext(ConnectionContext);

const ConnectionProvider = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [{ loading }, execute] = useAxios(
    {
      method: 'PATCH',
    },
    {
      manual: true,
    },
  );

  const connect = async (room, form, validation, setError, setAlert) => {
    if (setAlert !== null) {
      setAlert(null);
    }
    try {
      await execute({
        url: `${ENDPOINTS.connecting}${room}/`,
        data: form,
      });
      navigate(`/room/${room}`);
      sessionStorage.setItem('room', room);
    } catch (err) {
      if (setError !== null && setAlert !== null) {
        handleErrors(validation, err.response.data.details, setError, setAlert);
      } else {
        navigate('/', {
          state: {
            notification: {
              type: 'error',
              message: 'Failed to join the room',
            },
          },
          replace: true,
        });
      }
    }
  };

  const disconnect = async (room) => {
    try {
      await execute({
        url: `${ENDPOINTS.disconnecting}${room}/`,
      });
      sessionStorage.clear();
    } catch (err) {
      navigate('/', { replace: true });
    }
  };

  useEffect(() => {
    const room = sessionStorage.getItem('room');
    if (room !== null && location.pathname !== `/room/${room}`) {
      disconnect(room);
    }
  }, [location.pathname]);

  const value = useMemo(() => ({
    loading, connect, disconnect,
  }), [loading]);

  return (
    <ConnectionContext.Provider value={value}>
      {children}
    </ConnectionContext.Provider>
  );
};

export {
  useConnection, ConnectionProvider,
};
