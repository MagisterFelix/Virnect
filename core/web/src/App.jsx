import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import '@fontsource/poppins/400.css';
import '@fontsource/poppins/700.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/900.css';

import { createTheme, ThemeProvider } from '@mui/material/styles';

import { AuthorizedRoutes, AuthProvider, GuestRoutes } from '@context/AuthProvider';

import NotFound from '@components/404/NotFound';
import Authorization from '@components/auth/Authorization';
import PasswordReset from '@components/auth/PasswordReset';
import Registration from '@components/auth/Registration';
import Home from '@components/Home';
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
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<GuestRoutes />}>
            <Route path="/sign-in" element={<Authorization />} />
            <Route path="/sign-up" element={<Registration />} />
            <Route path="/reset-password/:uidb64?/:token?" element={<PasswordReset />} />
          </Route>
          <Route element={<AuthorizedRoutes />}>
            <Route path="/" element={<Home />} />
            <Route path="/user/:username" element={<User />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
