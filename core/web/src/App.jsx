import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import '@fontsource/poppins/400.css';
import '@fontsource/poppins/700.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/900.css';

import { createTheme, ThemeProvider } from '@mui/material/styles';

import Authorization from '@components/auth/Authorization';
import PasswordReset from '@components/auth/PasswordReset';
import Registration from '@components/auth/Registration';
import Home from '@components/Home';

import { AuthProvider, GuestRoutes, UserRoutes } from '@context/AuthProvider';

import styles from '@styles/_globals.scss';

import './App.scss';

const theme = createTheme({
  palette: {
    primary: {
      main: styles.purple,
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
          <Route element={<UserRoutes />}>
            <Route path="/" element={<Home />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
