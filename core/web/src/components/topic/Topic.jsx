import React from 'react';
import { Controller, useForm } from 'react-hook-form';

import {
  Box,
  LinearProgress,
  ListItemIcon,
  MenuItem,
  Typography,
} from '@mui/material';

import useAxios from '@api/axios';
import ENDPOINTS from '@api/endpoints';

import {
  DropdownList,
  LightTooltip,
} from '@utils/Styles';

import styles from '@styles/_globals.scss';

import './Topic.scss';

const Topic = () => {
  const [{ loading: loadingTopics, data: topics }] = useAxios(
    {
      url: ENDPOINTS.topics,
      method: 'GET',
    },
  );

  const { control } = useForm();

  return (
    <div className="Topic">
      <Box
        sx={{
          bgcolor: styles.color_white,
          borderRadius: 1,
        }}
      >
        <Controller
          name="topic"
          control={control}
          defaultValue="All"
          render={({
            field: { onChange, value },
          }) => (
            <DropdownList
              onChange={onChange}
              value={value}
              fullWidth
              select
              SelectProps={{
                MenuProps: {
                  style: {
                    maxHeight: 190,
                  },
                },
              }}
            >
              <MenuItem value="All">
                <Typography noWrap>
                  All topics
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
                              {topic.title}
                            </Typography>
                          </ListItemIcon>
                        </LightTooltip>
                      </MenuItem>
                    ),
                  )
                )}
            </DropdownList>
          )}
        />
      </Box>
    </div>
  );
};

export default Topic;
