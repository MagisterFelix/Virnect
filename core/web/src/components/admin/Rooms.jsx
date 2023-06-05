import React from 'react';

import {
  Container,
  Skeleton,
} from '@mui/material';

import ENDPOINTS from '@api/endpoints';

import { useAdmin } from '@providers/AdminProvider';

import EnhancedTable from '@utils/Tables';

const Rooms = () => {
  const { rooms, refetchRooms } = useAdmin();

  if (!rooms) {
    return (
      <Container>
        <Skeleton variant="rounded" height={300} sx={{ borderRadius: 2 }} />
      </Container>
    );
  }

  const fields = [
    { id: 'id', label: 'ID', type: 'integer' },
    { id: 'host', label: 'Host', type: 'string' },
    { id: 'title', label: 'Title', type: 'string' },
    { id: 'topic', label: 'Topic', type: 'image' },
    { id: 'language', label: 'Language', type: 'image' },
    { id: 'tags', label: 'Tags', type: 'array' },
    { id: 'participants', label: 'Participants', type: 'array' },
    { id: 'open', label: 'Open', type: 'boolean' },
    { id: 'created_at', label: 'Created at', type: 'datetime' },
  ];

  const data = rooms.map((room) => ({
    id: room.id,
    host: room.host.username,
    title: room.title,
    topic: room.topic.image,
    language: `${process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:8000' : ''}/static/languages/${room.language.toLowerCase()}.svg`,
    tags: room.tags,
    participants: room.participants,
    open: room.key.length === 0,
    created_at: room.created_at,
  }));

  return (
    <div className="Rooms">
      <Container>
        <EnhancedTable
          title="Room"
          fields={fields}
          initialData={data}
          endpoint={ENDPOINTS.room}
          refetchData={refetchRooms}
          searchBy="title"
          canDelete
        />
      </Container>
    </div>
  );
};

export default Rooms;
