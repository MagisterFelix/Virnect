import React from 'react';

import {
  Container,
  Grid,
} from '@mui/material';

import Dashboard from '@components/admin/Dashboard';
import Reports from '@components/admin/Reports';
import Rooms from '@components/admin/Rooms';
import Topics from '@components/admin/Topics';
import Users from '@components/admin/Users';

import './Admin.scss';

const Admin = () => (
  <div className="Admin">
    <Container>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item sx={{ width: '100%' }}>
          <Dashboard />
        </Grid>
        <Grid item sx={{ width: '100%' }}>
          <Users />
        </Grid>
        <Grid item sx={{ width: '100%' }}>
          <Reports />
        </Grid>
        <Grid item sx={{ width: '100%' }}>
          <Topics />
        </Grid>
        <Grid item sx={{ width: '100%' }}>
          <Rooms />
        </Grid>
      </Grid>
    </Container>
  </div>
);

export default Admin;
