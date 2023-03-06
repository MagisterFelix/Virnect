import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import useAxios from '@api/axios';
import ENDPOINTS from '@api/endpoints';

const AuthContext = createContext(null);

const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState(null);

  const [{ data }, fetchProfile] = useAxios(
    {
      url: ENDPOINTS.profile,
      method: 'GET',
    },
  );

  useEffect(() => {
    if (data !== undefined) {
      setIsAuthenticated(true);
      setProfile(data);
    } else {
      setIsAuthenticated(false);
      setProfile(null);
    }
  }, [data]);

  const value = React.useMemo(() => ({
    isAuthenticated, setIsAuthenticated, profile, fetchProfile,
  }), [isAuthenticated, setIsAuthenticated, profile, fetchProfile]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

const GuestRoutes = () => {
  const auth = useAuth();
  return !auth.isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

const UserRoutes = () => {
  const auth = useAuth();

  if (auth.profile == null) {
    return null;
  }

  return auth.isAuthenticated ? <Outlet /> : <Navigate to="/sign-in" replace />;
};

export {
  useAuth, AuthProvider, GuestRoutes, UserRoutes,
};
