import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import Cookies from 'js-cookie';

import '@fontsource/poppins/400.css';
import '@fontsource/poppins/700.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/900.css';

import { createTheme, ThemeProvider } from '@mui/material/styles';

import Authorization from '@components/auth/authorization';
import Main from '@components/main';

import colors from '@styles/colors.sass';
import './App.sass';

const theme = createTheme({
  palette: {
    primary: {
      main: colors.purple,
    },
  },
});

const App = () => {
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const token = Cookies.get('access_token');
    if (token) {
      setIsAuth(true);
    }
  }, [isAuth]);

  return (
    <ThemeProvider theme={theme}>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/sign-in" element={!isAuth ? <Authorization /> : <Navigate to="/" />} />
      </Routes>
    </ThemeProvider>
  );
};

export default App;
