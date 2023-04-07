import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {
  Box,
  Checkbox,
  LinearProgress,
  MenuItem,
  Typography,
} from '@mui/material';

import useAxios from '@api/axios';
import ENDPOINTS from '@api/endpoints';

import styles from '@styles/_globals.scss';

import { DropdownTextField } from '@utils/Styles';
import './Main.scss';

const Tag = () => {
  const [searchParams] = useSearchParams();

  const navigate = useNavigate();

  const [{ loading: loadingTags, data: tags }] = useAxios(
    {
      url: `${ENDPOINTS.tags}?unique=true`,
      method: 'GET',
    },
  );

  const [selectedTags, setSelectedTags] = useState(['All tags']);
  const handleSelectTag = (event) => {
    const { value } = event.target;
    if (value.length > 0 && value[0] === 'All tags') {
      setSelectedTags(value.slice(1));
      searchParams.set('tags', value.slice(1).join(','));
    } else if (value.length === 0 || (value.length > 0 && value[value.length - 1] === 'All tags')) {
      setSelectedTags(['All tags']);
      searchParams.delete('tags');
    } else {
      setSelectedTags(value);
      searchParams.set('tags', value.join(','));
    }
    navigate(`?${decodeURIComponent(searchParams.toString())}`);
  };

  useEffect(() => {
    const tagsParam = searchParams.get('tags');
    if (tags !== undefined && tagsParam !== null) {
      const tagParams = tagsParam.split(',').filter((tag) => tags.map((obj) => obj.name).includes(tag));
      if (tagParams.length !== 0) {
        setSelectedTags(tagParams);
      }
    }
  }, [searchParams, tags]);

  return (
    <div className="Tag">
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
            multiple: true,
            value: selectedTags,
            onChange: handleSelectTag,
            renderValue: (selected) => (selected.indexOf('All tags') > -1 ? `🏷️ ${selected}` : selected.sort().join(', ')),
            MenuProps: {
              style: {
                maxHeight: 300,
              },
            },
          }}
        >
          <MenuItem value="All tags">
            <Typography noWrap>
              <span>🏷️ All tags</span>
            </Typography>
          </MenuItem>
          {loadingTags
            ? (<LinearProgress sx={{ m: 2 }} />)
            : (
              tags.map(
                (tag) => (
                  <MenuItem key={tag.id} value={tag.name} sx={{ ml: -1 }}>
                    <Checkbox checked={selectedTags.indexOf(tag.name) > -1} />
                    <Typography noWrap>
                      <span>{tag.name}</span>
                    </Typography>
                  </MenuItem>
                ),
              )
            )}
        </DropdownTextField>
      </Box>
    </div>
  );
};

export default Tag;
