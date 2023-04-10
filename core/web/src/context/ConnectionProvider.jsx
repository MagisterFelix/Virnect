import React, {
  createContext,
  useContext,
  useMemo,
} from 'react';
import { useNavigate } from 'react-router-dom';

import useAxios from '@api/axios';
import ENDPOINTS from '@api/endpoints';

const ConnectionContext = createContext(null);

const useConnection = () => useContext(ConnectionContext);

const ConnectionProvider = ({ children }) => {
  const navigate = useNavigate();

  const [{ loading }, execute] = useAxios(
    {
      method: 'PATCH',
    },
    {
      manual: true,
    },
  );

  const connect = async (room, key) => {
    const form = {
      key,
    };
    try {
      await execute({
        url: `${ENDPOINTS.connecting}${room}/`,
        data: form,
      });
    } catch (err) {
      navigate('/', {
        state: {
          toast: {
            type: 'error',
            message: err.response.status === 404
              ? `The «${room}» room was not found.`
              : `Failed to join the «${room}» room. ${err.response.data.details[0].detail}`,
          },
        },
        replace: true,
      });
    }
  };

  const disconnect = async (room) => {
    try {
      await execute({
        url: `${ENDPOINTS.disconnecting}${room}/`,
      });
    } catch (err) {
      navigate('/', { replace: true });
    }
  };

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
