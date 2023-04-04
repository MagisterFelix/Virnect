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

import { DropdownTextField } from '@utils/Styles';

import styles from '@styles/_globals.scss';

import './Main.scss';

const Language = () => {
  const [{ loading: loadingRoomOptions, data: roomOptions }] = useAxios(
    {
      url: ENDPOINTS.rooms,
      method: 'OPTIONS',
    },
  );

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [selectedLanguage, setSelectedLanguage] = useState('All languages');
  const handleSelectLanguage = (event) => {
    const { value } = event.target;
    setSelectedLanguage(value);
    if (value !== 'All languages') {
      searchParams.set('language', value);
    } else {
      searchParams.delete('language');
    }
    navigate(`?${decodeURIComponent(searchParams.toString())}`);
  };

  useEffect(() => {
    const languageParam = searchParams.get('language');
    if (roomOptions !== undefined
      && roomOptions.actions.POST.language.choices.find(
        (language) => language.value === languageParam,
      )) {
      setSelectedLanguage(languageParam || 'All languages');
    }
  }, [searchParams, roomOptions]);

  return (
    <div className="Language">
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
            value: selectedLanguage,
            onChange: handleSelectLanguage,
            MenuProps: {
              style: {
                maxHeight: 300,
              },
            },
          }}
        >
          <MenuItem value="All languages">
            <Typography noWrap>
              <span>All languages</span>
            </Typography>
          </MenuItem>
          {loadingRoomOptions
            ? (<LinearProgress sx={{ m: 2 }} />)
            : (
              roomOptions.actions.POST.language.choices.map(
                (language) => (
                  <MenuItem key={language.value} value={language.display_name}>
                    <ListItemIcon
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        color: styles.color_black,
                      }}
                    >
                      <Box
                        component="img"
                        src={`https://flagcdn.com/${language.value.toLowerCase()}.svg`}
                        pr={1}
                        width={24}
                      />
                      <Typography noWrap>
                        <span>{language.display_name}</span>
                      </Typography>
                    </ListItemIcon>
                  </MenuItem>
                ),
              )
            )}
        </DropdownTextField>
      </Box>
    </div>
  );
};

export default Language;
