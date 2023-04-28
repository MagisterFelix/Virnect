import React from 'react';

import {
  Container,
  Skeleton,
} from '@mui/material';

import ENDPOINTS from '@api/endpoints';

import { useAdmin } from '@providers/AdminProvider';

import { TopicDialog } from '@utils/Dialogs';
import EnhancedTable from '@utils/Tables';

const Topics = () => {
  const { topics, refetchTopics } = useAdmin();

  if (!topics) {
    return (
      <Container>
        <Skeleton variant="rounded" height={300} sx={{ borderRadius: 2 }} />
      </Container>
    );
  }

  const fields = [
    { id: 'id', label: 'ID', type: 'integer' },
    { id: 'title', label: 'Title', type: 'string' },
    { id: 'description', label: 'Description', type: 'string' },
    { id: 'image', label: 'Image', type: 'image' },
  ];

  const data = topics.map((topic) => ({
    id: topic.id,
    title: topic.title,
    description: topic.description,
    image: topic.image,
  }));

  return (
    <div className="Topics">
      <Container>
        <EnhancedTable
          title="Topic"
          fields={fields}
          initialData={data}
          endpoint={ENDPOINTS.topic}
          refetchData={refetchTopics}
          Dialog={TopicDialog}
          searchBy="title"
          canAdd
          canEdit
          canDelete
        />
      </Container>
    </div>
  );
};

export default Topics;
