import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {
  Box,
  LinearProgress,
  ListItemIcon,
  MenuItem,
  Typography,
} from '@mui/material';

import useAxios from '@api/axios';
import ENDPOINTS from '@api/endpoints';

import { DropdownTextField, LightTooltip } from '@utils/Styles';

import styles from '@styles/_globals.scss';

import './Main.scss';

const Topic = () => {
  const [searchParams] = useSearchParams();

  const navigate = useNavigate();

  const [{ loading: loadingTopics, data: topics }] = useAxios(
    {
      url: ENDPOINTS.topics,
      method: 'GET',
    },
  );

  const [selectedTopic, setSelectedTopic] = useState('All topics');
  const handleSelectTopic = (event) => {
    const { value } = event.target;
    setSelectedTopic(value);
    if (value !== 'All topics') {
      searchParams.set('topic', value);
    } else {
      searchParams.delete('topic');
    }
    navigate(`?${decodeURIComponent(searchParams.toString())}`);
  };

  useEffect(() => {
    const topicParam = searchParams.get('topic');
    if (topics !== undefined && topics.find((topic) => topic.title === topicParam)) {
      setSelectedTopic(topicParam);
    }
  }, [searchParams, topics]);

  return (
    <div className="Topic">
      <Box
        sx={{
          bgcolor: styles.color_white,
          borderRadius: 1,
        }}
      >
        <DropdownTextField
          fullWidth
          select
          SelectProps={{
            value: selectedTopic,
            onChange: handleSelectTopic,
            MenuProps: {
              style: {
                maxHeight: 300,
              },
            },
          }}
        >
          <MenuItem value="All topics">
            <Typography noWrap>
              <span>💬 All topics</span>
            </Typography>
          </MenuItem>
          {loadingTopics
            ? (<LinearProgress sx={{ m: 2 }} />)
            : (
              topics.map(
                (topic) => (
                  <MenuItem key={topic.id} value={topic.title}>
                    <LightTooltip title={topic.description} placement="left" arrow enterDelay={1000} sx={{ pr: 2 }}>
                      <ListItemIcon
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          color: styles.color_black,
                        }}
                      >
                        <Box
                          component="img"
                          src={topic.image}
                          alt={topic.title}
                          pr={1}
                          sx={{
                            height: 24,
                            width: 24,
                          }}
                        />
                        <Typography noWrap>
                          <span>{topic.title}</span>
                        </Typography>
                      </ListItemIcon>
                    </LightTooltip>
                  </MenuItem>
                ),
              )
            )}
        </DropdownTextField>
      </Box>
    </div>
  );
};

export default Topic;
