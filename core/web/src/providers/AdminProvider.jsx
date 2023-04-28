import React, { createContext, useContext, useMemo } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import useAxios from '@api/axios';
import ENDPOINTS from '@api/endpoints';

import { useAuth } from '@providers/AuthProvider';

const AdminContext = createContext(null);

const useAdmin = () => useContext(AdminContext);

const AdminProvider = ({ children }) => {
  const [{ data: statistics }] = useAxios(
    {
      url: ENDPOINTS.statistics,
      method: 'GET',
    },
  );

  const [{ data: users }, refetchUsers] = useAxios(
    {
      url: ENDPOINTS.users,
      method: 'GET',
    },
  );

  const [{ data: reportOptions }] = useAxios(
    {
      url: ENDPOINTS.reports,
      method: 'OPTIONS',
    },
  );

  const [{ data: reports }, refetchReports] = useAxios(
    {
      url: ENDPOINTS.reports,
      method: 'GET',
    },
  );

  const [{ data: topics }, refetchTopics] = useAxios(
    {
      url: ENDPOINTS.topics,
      method: 'GET',
    },
  );

  const [{ data: rooms }, refetchRooms] = useAxios(
    {
      url: `${ENDPOINTS.rooms}?no_pagination=true`,
      method: 'GET',
    },
  );

  const value = useMemo(() => ({
    statistics,
    users,
    refetchUsers,
    reportOptions,
    reports,
    refetchReports,
    topics,
    refetchTopics,
    rooms,
    refetchRooms,
  }), [statistics, users, reportOptions, reports, topics, rooms]);

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

const AdminRoutes = () => {
  const { profile } = useAuth();
  return profile.is_staff ? <Outlet /> : <Navigate to="/" replace />;
};

export {
  useAdmin, AdminProvider, AdminRoutes,
};
