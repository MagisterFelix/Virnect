import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { w3cwebsocket as W3CWebSocket } from 'websocket';

import useAxios from '@api/axios';
import ENDPOINTS from '@api/endpoints';

import { useAuth } from '@providers/AuthProvider';

const NotificationContext = createContext(null);

const useNotification = () => useContext(NotificationContext);

const NotificationProvider = ({ children }) => {
  const { profile } = useAuth();

  const socket = useMemo(() => new W3CWebSocket(`${ENDPOINTS.wsNotificationList}`), []);

  const [notifications, setNotifications] = useState(profile.notifications);

  const [, refetchNotificationList] = useAxios(
    {
      url: ENDPOINTS.notifications,
      method: 'GET',
    },
    {
      manual: true,
    },
  );

  const [{ loading }, execute] = useAxios(
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
    await execute({
      url: `${ENDPOINTS.notification}${notification}/`,
      data: formData,
    });
    const response = await refetchNotificationList();
    setNotifications(response.data);
  };

  const viewAll = async (toView) => {
    const formData = {
      is_viewed: true,
    };
    const promises = toView.map((notification) => execute({
      url: `${ENDPOINTS.notification}${notification.id}/`,
      data: formData,
    }));
    await Promise.all(promises);
    const response = await refetchNotificationList();
    setNotifications(response.data);
  };

  useEffect(() => {
    socket.onmessage = async (message) => {
      const data = JSON.parse(message.data);
      if (data.type === 'notification_list_update') {
        const response = await refetchNotificationList();
        setNotifications(response.data);
      }
    };

    return () => {
      socket.close();
    };
  }, [socket]);

  const value = useMemo(() => ({
    loading, notifications, refetchNotificationList, viewNotification, viewAll,
  }), [loading, notifications]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export {
  useNotification, NotificationProvider,
};
