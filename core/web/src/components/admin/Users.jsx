import React from 'react';

import {
  Container,
  Skeleton,
} from '@mui/material';

import ENDPOINTS from '@api/endpoints';

import { useAdmin } from '@providers/AdminProvider';

import { UserDialog } from '@utils/Dialogs';
import EnhancedTable from '@utils/Tables';

const Users = () => {
  const { users, refetchUsers } = useAdmin();

  if (!users) {
    return (
      <Container>
        <Skeleton variant="rounded" height={300} sx={{ borderRadius: 2 }} />
      </Container>
    );
  }

  const fields = [
    { id: 'id', label: 'ID', type: 'integer' },
    { id: 'username', label: 'Username', type: 'string' },
    { id: 'full_name', label: 'Name', type: 'string' },
    { id: 'image', label: 'Image', type: 'image' },
    { id: 'is_active', label: 'Active', type: 'boolean' },
    { id: 'is_staff', label: 'Staff', type: 'boolean' },
    { id: 'is_superuser', label: 'Admin', type: 'boolean' },
    { id: 'last_seen', label: 'Last seen', type: 'datetime' },
  ];

  const data = users.map((user) => ({
    id: user.id,
    username: user.username,
    full_name: user.full_name,
    image: user.image,
    is_active: user.is_active,
    is_staff: user.is_staff,
    is_superuser: user.is_superuser,
    last_seen: user.last_seen,
  }));

  return (
    <div className="Users">
      <Container>
        <EnhancedTable
          title="User"
          fields={fields}
          initialData={data}
          endpoint={ENDPOINTS.user}
          refetchData={refetchUsers}
          Dialog={UserDialog}
          searchBy="username"
          canEdit
        />
      </Container>
    </div>
  );
};

export default Users;
