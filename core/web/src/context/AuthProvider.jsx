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
  const [{ loading: loadingProfile, data: profile }, refetchProfile] = useAxios(
    {
      url: ENDPOINTS.profile,
      method: 'GET',
    },
  );

  const ping = async () => {
    await refetchProfile();
  };

  useEffect(() => {
    if (!profile) {
      return undefined;
    }
    const interval = setInterval(() => ping(), 60000);
    return () => clearInterval(interval);
  }, [profile]);

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
      await refetchProfile();
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
      await refetchProfile();
    } catch (err) {
      handleErrors(validation, err.response.data.details, setError, setAlert);
    }
  };

  const logout = async () => {
    await execute({
      url: ENDPOINTS.deauthorization,
    });
    window.location.reload();
  };

  const resetPassword = async (uidb64, token, form, validation, setError, setAlert) => {
    try {
      const response = await execute({
        url: ENDPOINTS.reset_password + ((uidb64 && token) ? `${uidb64}/${token}/` : ''),
        data: form,
      });
      setAlert({ type: 'success', message: response.data.details });
    } catch (err) {
      handleErrors(validation, err.response.data.details, setError, setAlert);
    }
  };

  const value = useMemo(() => ({
    loading, loadingProfile, profile, refetchProfile, login, register, logout, resetPassword,
  }), [loading, loadingProfile, profile]);

  return (
    <AuthContext.Provider value={value}>
      {loadingProfile && !profile
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
        )
        : children}
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
