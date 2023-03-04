import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Alert,
  Button,
  Snackbar,
} from '@mui/material';

import useAxios from '@api/axios';
import ENDPOINTS from '@api/endpoints';

import './Home.scss';

const Home = () => {
  const [open, setOpen] = useState(false);

  const [{ error }, execute] = useAxios(
    {
      method: 'POST',
    },
    {
      manual: true,
    },
  );

  const navigate = useNavigate();

  const handleClose = () => {
    setOpen(false);
  };

  const handleOnLogout = async () => {
    try {
      await execute({
        url: ENDPOINTS.deauthorization,
      });
      navigate('/sign-in', { replace: true });
    } catch {
      setOpen(true);
    }
  };

  return (
    <div className="Home">
      <Button variant="contained" onClick={handleOnLogout}>
        Logout
      </Button>
      {error && (
      <Snackbar open={open} autoHideDuration={3000} onClose={handleClose}>
        <Alert severity="error">Something went wrong...</Alert>
      </Snackbar>
      )}
    </div>
  );
};

export default Home;
