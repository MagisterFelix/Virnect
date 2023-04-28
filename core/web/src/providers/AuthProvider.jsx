import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';

import { w3cwebsocket as W3CWebSocket } from 'websocket';

import {
  CircularProgress,
} from '@mui/material';

import { toast } from 'react-toastify';

import useAxios from '@api/axios';
import ENDPOINTS from '@api/endpoints';
import handleErrors from '@api/errors';

import Navbar from '@components/navbar/Navbar';

const AuthContext = createContext(null);

const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const socket = useMemo(() => new W3CWebSocket(`${ENDPOINTS.wsProfile}`), []);

  const [{ loading: loadingProfile, data: profile }, refetchProfile] = useAxios(
    {
      url: ENDPOINTS.profile,
      method: 'GET',
    },
  );

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
      window.location.reload();
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
      window.location.reload();
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
        url: ENDPOINTS.passwordReset + ((uidb64 && token) ? `${uidb64}/${token}/` : ''),
        data: form,
      });
      if (uidb64 && token) {
        navigate('/sign-in', { replace: true });
        toast(response.data.details, { type: 'success' });
      } else {
        setAlert({ type: 'success', message: response.data.details });
      }
    } catch (err) {
      handleErrors(validation, err.response.data.details, setError, setAlert);
    }
  };

  const [{ loading: loadingNotifications, data: notifications }, refetchNotifications] = useAxios(
    {
      url: ENDPOINTS.notifications,
      method: 'GET',
    },
  );

  const [, updateNotification] = useAxios(
    {
      method: 'PATCH',
    },
    {
      manual: true,
      autoCancel: false,
    },
  );

  const viewNotification = async (notification) => {
    const formData = {
      is_viewed: true,
    };
    await updateNotification({
      url: `${ENDPOINTS.notification}${notification}/`,
      data: formData,
    });
    await refetchNotifications();
  };

  const viewAll = async (toView) => {
    const formData = {
      is_viewed: true,
    };
    const promises = toView.map((notification) => updateNotification({
      url: `${ENDPOINTS.notification}${notification.id}/`,
      data: formData,
    }));
    await Promise.all(promises);
    await refetchNotifications();
  };

  useEffect(() => {
    socket.onmessage = async (message) => {
      const data = JSON.parse(message.data);
      if (data.type === 'notification_list_update') {
        await refetchNotifications();
      } else if (data.type === 'ban') {
        window.location.reload();
      }
    };
  }, [socket]);

  const value = useMemo(() => ({
    loading,
    loadingProfile,
    profile,
    refetchProfile,
    login,
    register,
    logout,
    resetPassword,
    loadingNotifications,
    notifications,
    refetchNotifications,
    viewNotification,
    viewAll,
  }), [loading, loadingProfile, profile, loadingNotifications, notifications]);

  return (
    <AuthContext.Provider value={value}>
      {(loadingProfile && !profile) || (loadingNotifications && !notifications)
        ? (
          <div
            style={{
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

const AuthorizedRoutes = () => {
  const { profile } = useAuth();
  return profile
    ? (
      <>
        <Navbar />
        <Outlet />
      </>
    ) : <Navigate to="/sign-in" replace />;
};

export {
  useAuth, AuthProvider, GuestRoutes, AuthorizedRoutes,
};
