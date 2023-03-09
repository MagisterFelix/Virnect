import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { CircularProgress } from '@mui/material';

import useAxios from '@api/axios';
import ENDPOINTS from '@api/endpoints';
import handleErrors from '@api/errors';

const AuthContext = createContext(null);

const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [{ loading: loadingProfile, data: profile }, getProfile] = useAxios(
    {
      url: ENDPOINTS.profile,
      method: 'GET',
    },
  );

  const [{ response }, ping] = useAxios(
    {
      method: 'GET',
    },
    {
      manual: true,
    },
  );

  useEffect(() => {
    if (response && response.status !== 200) {
      window.location.reload();
    }
    const interval = setInterval(() => ping(), 60000);
    return () => clearInterval(interval);
  }, [response]);

  const [{ loading }, execute] = useAxios(
    {
      method: 'POST',
    },
    {
      manual: true,
    },
  );

  const login = async (form, validation, setError, setAlert) => {
    try {
      await execute({
        url: ENDPOINTS.authorization,
        data: form,
      });
      getProfile();
    } catch (err) {
      handleErrors(validation, err.response.data.details, setError, setAlert);
    }
  };

  const register = async (form, validation, setError, setAlert) => {
    try {
      await execute({
        url: ENDPOINTS.registration,
        data: form,
      });
      await execute({
        url: ENDPOINTS.authorization,
        data: form,
      });
      getProfile();
    } catch (err) {
      handleErrors(validation, err.response.data.details, setError, setAlert);
    }
  };

  const logout = async (setAlert) => {
    try {
      await execute({
        url: ENDPOINTS.deauthorization,
        method: 'POST',
      });
      window.location.reload();
    } catch (err) {
      setAlert(true);
    }
  };

  const value = useMemo(() => ({
    loading, profile, getProfile, login, register, logout,
  }), [loading, profile]);

  return (
    <AuthContext.Provider value={value}>
      {loadingProfile
        ? (
          <div style={{
            minHeight: '100dvh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          >
            <CircularProgress />
          </div>
        ) : children}
    </AuthContext.Provider>
  );
};

const GuestRoutes = () => {
  const { profile } = useAuth();
  return !profile ? <Outlet /> : <Navigate to="/" replace />;
};

const UserRoutes = () => {
  const { profile } = useAuth();
  return profile ? <Outlet /> : <Navigate to="/sign-in" replace />;
};

export {
  useAuth, AuthProvider, GuestRoutes, UserRoutes,
};
