import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';

import { CircularProgress } from '@mui/material';

import { toast } from 'react-toastify';

import useAxios from '@api/axios';
import ENDPOINTS from '@api/endpoints';
import handleErrors from '@api/errors';

const AuthContext = createContext(null);

const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

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
      autoCancel: false,
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

  const [{
    loading: loadingNotificationList,
    data: notificationList,
  }, refetchNotificationList] = useAxios(
    {
      url: ENDPOINTS.notifications,
      method: 'GET',
    },
    {
      autoCancel: false,
    },
  );

  const viewNotification = async (notification) => {
    const formData = {
      is_viewed: true,
    };
    await execute({
      url: `${ENDPOINTS.notification}${notification}/`,
      method: 'PATCH',
      data: formData,
    });
    await refetchNotificationList();
  };

  const viewAll = async (toView) => {
    const formData = {
      is_viewed: true,
    };
    const promises = toView.map((notification) => execute({
      url: `${ENDPOINTS.notification}${notification.id}/`,
      method: 'PATCH',
      data: formData,
    }));
    await Promise.all(promises);
    await refetchNotificationList();
  };

  const value = useMemo(() => ({
    loading,
    loadingProfile,
    profile,
    refetchProfile,
    login,
    register,
    logout,
    resetPassword,
    loadingNotificationList,
    notificationList,
    refetchNotificationList,
    viewNotification,
    viewAll,
  }), [loading, loadingProfile, profile, loadingNotificationList, notificationList]);

  return (
    <AuthContext.Provider value={value}>
      {(loadingProfile || loadingNotificationList) && (!profile || !notificationList)
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

const AuthorizedRoutes = () => {
  const { profile } = useAuth();
  return profile ? <Outlet /> : <Navigate to="/sign-in" replace />;
};

export {
  useAuth, AuthProvider, GuestRoutes, AuthorizedRoutes,
};
