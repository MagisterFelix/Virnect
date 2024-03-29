import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import '@fontsource/poppins/400.css';
import '@fontsource/poppins/700.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/900.css';

import { createTheme, ThemeProvider } from '@mui/material/styles';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';

import { AdminProvider, AdminRoutes } from '@providers/AdminProvider';
import { AuthorizedRoutes, AuthProvider, GuestRoutes } from '@providers/AuthProvider';
import { RoomListProvider, RoomProvider } from '@providers/RoomDataProvider';

import NotFound from '@components/404/NotFound';
import Admin from '@components/admin/Admin';
import Authorization from '@components/auth/Authorization';
import PasswordReset from '@components/auth/PasswordReset';
import Registration from '@components/auth/Registration';
import Home from '@components/Home';
import Room from '@components/room/Room';
import Settings from '@components/user/Settings';
import User from '@components/user/User';

import styles from '@styles/_globals.scss';

import './App.scss';

const theme = createTheme({
  palette: {
    primary: {
      main: styles.color_purple,
    },
  },
});

const App = () => (
  <ThemeProvider theme={theme}>
    <ToastContainer position="top-left" style={{ marginTop: '5.65em' }} />
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<GuestRoutes />}>
            <Route path="/sign-in" element={<Authorization />} />
            <Route path="/sign-up" element={<Registration />} />
            <Route path="/reset-password/:uidb64?/:token?" element={<PasswordReset />} />
          </Route>
          <Route element={<AuthorizedRoutes />}>
            <Route
              path="/"
              element={(
                <RoomListProvider>
                  <Home />
                </RoomListProvider>
              )}
            />
            <Route
              path="/room/:title"
              element={(
                <RoomProvider>
                  <Room />
                </RoomProvider>
              )}
            />
            <Route
              path="/user/:username"
              element={(
                <RoomListProvider>
                  <User />
                </RoomListProvider>
              )}
            />
            <Route path="/settings" element={<Settings />} />
            <Route element={<AdminRoutes />}>
              <Route
                path="/admin"
                element={(
                  <AdminProvider>
                    <Admin />
                  </AdminProvider>
                )}
              />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </ThemeProvider>
);

export default App;
