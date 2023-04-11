import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {
  Box,
  Button,
  Checkbox,
  Grid,
  IconButton,
  InputBase,
  LinearProgress,
  ListItemIcon,
  ListSubheader,
  Menu,
  MenuItem,
  Pagination,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import {
  Add,
  Clear,
  Search,
  Settings,
  Sort,
} from '@mui/icons-material';

import { useRoomData } from '@context/RoomDataProvider';

import { RoomForm } from '@utils/Forms';
import {
  DropdownButton, DropdownTextField, LightPaginationItem, LightTooltip,
} from '@utils/Styles';

import styles from '@styles/_globals.scss';

const Panel = () => {
  const [searchParams] = useSearchParams();

  const navigate = useNavigate();

  const {
    pageCount,
    loadingTopicList, topicList,
    loadingRoomOptions, roomOptions,
    loadingRoomList, roomList,
    loadingTagList, tagList,
    setSearchLoading,
  } = useRoomData();

  const underSm = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  const [page, setPage] = useState(1);
  const handleSelectPage = (event, value) => {
    event.preventDefault();
    if (value !== page) {
      setSearchLoading(true);
    }
    setPage(value);
    if (value !== 1) {
      searchParams.set('page', value);
    } else {
      searchParams.delete('page');
    }
    navigate(`?${decodeURIComponent(searchParams.toString())}`);
  };

  const [searchTerm, setSearchTerm] = useState('');
  const handleSearch = (event) => {
    setSearchLoading(true);
    const { value } = event.target;
    setSearchTerm(value);
    if (value) {
      searchParams.set('search', value);
      setPage(1);
      searchParams.delete('page');
    } else {
      searchParams.delete('search');
    }
    navigate(`?${decodeURIComponent(searchParams.toString())}`);
  };
  const handleClearSearch = () => {
    setSearchLoading(true);
    setSearchTerm('');
    searchParams.delete('search');
    navigate(`?${decodeURIComponent(searchParams.toString())}`);
  };

  const [alert, setAlert] = useState(null);
  const formRoomCreation = useForm();

  const [openRoomCreationDialog, setOpenRoomCreationDialog] = useState(false);
  const handleOpenRoomCreationDialog = () => {
    formRoomCreation.reset();
    setAlert(null);
    setOpenRoomCreationDialog(true);
  };

  const [selectedTopic, setSelectedTopic] = useState('All topics');
  const handleSelectTopic = (event) => {
    setSearchLoading(true);
    const { value } = event.target;
    setSelectedTopic(value);
    if (value !== 'All topics') {
      searchParams.set('topic', value);
      setPage(1);
      searchParams.delete('page');
    } else {
      searchParams.delete('topic');
    }
    navigate(`?${decodeURIComponent(searchParams.toString())}`);
  };

  const [selectedLanguage, setSelectedLanguage] = useState('All languages');
  const handleSelectLanguage = (event) => {
    setSearchLoading(true);
    const { value } = event.target;
    setSelectedLanguage(value);
    if (value !== 'All languages') {
      searchParams.set('language', value);
      setPage(1);
      searchParams.delete('page');
    } else {
      searchParams.delete('language');
    }
    navigate(`?${decodeURIComponent(searchParams.toString())}`);
  };

  const [selectedTags, setSelectedTags] = useState(['All tags']);
  const handleSelectTag = (event) => {
    setSearchLoading(true);
    const { value } = event.target;
    if (value.length > 0 && value[0] === 'All tags') {
      setSelectedTags(value.slice(1));
      searchParams.set('tags', value.slice(1).join(','));
      setPage(1);
      searchParams.delete('page');
    } else if (value.length === 0 || (value.length > 0 && value[value.length - 1] === 'All tags')) {
      setSelectedTags(['All tags']);
      searchParams.delete('tags');
    } else {
      setSelectedTags(value);
      searchParams.set('tags', value.join(','));
      setPage(1);
      searchParams.delete('page');
    }
    navigate(`?${decodeURIComponent(searchParams.toString())}`);
  };

  const [selectedExtra, setSelectedExtra] = useState([]);
  const [anchorElExtra, setAnchorElExtra] = useState(null);
  const handleOpenExtra = (event) => setAnchorElExtra(event.currentTarget);
  const handleCloseExtra = () => setAnchorElExtra(null);
  const handleSelectExtra = (value) => () => {
    setSearchLoading(true);
    const currentIndex = selectedExtra.indexOf(value);
    const newSelectedValues = [...selectedExtra];
    if (currentIndex === -1) {
      newSelectedValues.push(value);
    } else {
      newSelectedValues.splice(currentIndex, 1);
    }
    setSelectedExtra(newSelectedValues);
    if (newSelectedValues.indexOf(value) > -1) {
      searchParams.set(value, true);
      setPage(1);
      searchParams.delete('page');
    } else {
      searchParams.delete(value);
    }
    navigate(`?${decodeURIComponent(searchParams.toString())}`);
  };

  const [selectedOrdering, setSelectedOrdering] = useState('-created_at');
  const [anchorElOrdering, setAnchorElOrdering] = useState(null);
  const handleOpenOrdering = (event) => setAnchorElOrdering(event.currentTarget);
  const handleCloseOrdering = () => setAnchorElOrdering(null);
  const handleSelectOrdering = (option) => () => {
    setAnchorElOrdering(null);
    setSelectedOrdering(option);
    if (option !== '-created_at') {
      searchParams.set('ordering', option);
    } else {
      searchParams.delete('ordering');
    }
    navigate(`?${decodeURIComponent(searchParams.toString())}`);
  };

  useEffect(() => {
    const pageParam = searchParams.get('page');
    if (pageParam !== null) {
      const pageNum = parseInt(pageParam, 10);
      if (!Number.isNaN(pageNum)) {
        setPage(pageNum);
      }
    }

    const searchParam = searchParams.get('search');
    if (searchParam !== null) {
      setSearchTerm(searchParam);
    }

    const topicParam = searchParams.get('topic');
    if (topicList !== undefined && topicList.find((topic) => topic.title === topicParam)) {
      setSelectedTopic(topicParam);
    }

    const languageParam = searchParams.get('language');
    if (roomOptions !== undefined && roomOptions.actions.POST.language.choices.find(
      (language) => language.display_name === languageParam,
    )) {
      setSelectedLanguage(languageParam);
    }

    const tagsParam = searchParams.get('tags');
    if (tagList !== undefined && tagsParam !== null) {
      const tagParams = tagsParam.split(',').filter((tag) => tagList.map((obj) => obj.name).includes(tag));
      if (tagParams.length !== 0) {
        setSelectedTags(tagParams);
      }
    }

    const isAvailableParam = searchParams.get('is_available');
    const isOpenParam = searchParams.get('is_open');
    if (isAvailableParam !== null && isOpenParam !== null) {
      setSelectedExtra(['is_available', 'is_open']);
    } else if (isAvailableParam !== null && isOpenParam === null) {
      setSelectedExtra(['is_available']);
    } else if (isAvailableParam === null && isOpenParam !== null) {
      setSelectedExtra(['is_open']);
    }

    const orderingParam = searchParams.get('ordering');
    if (orderingParam !== null) {
      setSelectedOrdering(orderingParam);
    }
  }, [searchParams, topicList, roomOptions]);

  useEffect(() => {
    if (!loadingRoomList && roomList) {
      setSearchLoading(false);
    }
  }, [loadingRoomList, roomList]);

  return (
    <div className="Panel">
      <Grid container>
        <Grid container justifyContent="center" spacing={2}>
          <Grid item xs={9} sm={8} md={9} lg={10} mb={2}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                bgcolor: styles.color_white,
                p: 1,
                borderRadius: 1,
              }}
            >
              <InputBase
                placeholder="Search"
                value={searchTerm}
                onChange={handleSearch}
                sx={{
                  flex: 1,
                  ml: 1,
                }}
              />
              {searchTerm
                ? (
                  <IconButton onClick={handleClearSearch}>
                    <Clear />
                  </IconButton>
                ) : (
                  <IconButton>
                    <Search />
                  </IconButton>
                )}
            </Box>
          </Grid>
          <Grid item xs={3} sm={4} md={3} lg={2} mb={2}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleOpenRoomCreationDialog}
              sx={{
                height: '100%',
                textTransform: 'none',
                fontSize: styles.font_small,
              }}
            >
              <Add />
              <span style={{ display: useMediaQuery(useTheme().breakpoints.down('sm')) ? 'none' : 'flex' }}>Add room</span>
            </Button>
            <RoomForm
              form={formRoomCreation}
              alert={alert}
              setAlert={setAlert}
              openDialog={openRoomCreationDialog}
              setOpenDialog={setOpenRoomCreationDialog}
            />
          </Grid>
        </Grid>
        <Grid container justifyContent="center" spacing={2}>
          <Grid item xs={6} sm={2.5} lg={3}>
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
                {loadingTopicList
                  ? (<LinearProgress sx={{ m: 2 }} />)
                  : (
                    topicList.map(
                      (topic) => (
                        <MenuItem key={topic.id} value={topic.title}>
                          <LightTooltip title={topic.description} placement="left" arrow enterDelay={500} sx={{ pr: 2 }}>
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
          </Grid>
          <Grid item xs={6} sm={2.5} lg={3}>
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
                    <span>🌐 All languages</span>
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
          </Grid>
          <Grid item xs={6} sm={3} md={4}>
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
                {loadingTagList
                  ? (<LinearProgress sx={{ m: 2 }} />)
                  : (
                    tagList.map(
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
          </Grid>
          <Grid item xs={3} sm={2} md={1.5} lg={1}>
            <Box
              sx={{
                display: 'flex',
                height: '100%',
                bgcolor: styles.color_white,
                borderRadius: 1,
              }}
            >
              <DropdownButton fullWidth onClick={handleOpenExtra} sx={{ color: styles.color_dark }}>
                <Settings />
              </DropdownButton>
              <Menu
                anchorEl={anchorElExtra}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
                open={Boolean(anchorElExtra)}
                onClose={handleCloseExtra}
                MenuListProps={{ dense: true }}
              >
                <MenuItem onClick={handleSelectExtra('is_available')} sx={{ ml: -1 }}>
                  <Checkbox checked={selectedExtra.indexOf('is_available') > -1} />
                  <Typography noWrap sx={{ mr: 1 }}>
                    <span>Only available</span>
                  </Typography>
                </MenuItem>
                <MenuItem onClick={handleSelectExtra('is_open')} sx={{ ml: -1 }}>
                  <Checkbox checked={selectedExtra.indexOf('is_open') > -1} />
                  <Typography noWrap sx={{ mr: 1 }}>
                    <span>Only open</span>
                  </Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Grid>
          <Grid item xs={3} sm={2} md={1.5} lg={1}>
            <Box
              sx={{
                display: 'flex',
                height: '100%',
                bgcolor: styles.color_white,
                borderRadius: 1,
              }}
            >
              <DropdownButton
                fullWidth
                onClick={handleOpenOrdering}
                sx={{ color: styles.color_dark }}
              >
                <Sort />
              </DropdownButton>
              <Menu
                anchorEl={anchorElOrdering}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
                open={Boolean(anchorElOrdering)}
                onClose={handleCloseOrdering}
                MenuListProps={{ dense: true }}
              >
                <ListSubheader>Order by creation time</ListSubheader>
                <MenuItem selected={selectedOrdering === '-created_at'} onClick={handleSelectOrdering('-created_at')}>
                  <Typography noWrap>
                    <span>New rooms first</span>
                  </Typography>
                </MenuItem>
                <MenuItem selected={selectedOrdering === 'created_at'} onClick={handleSelectOrdering('created_at')}>
                  <Typography noWrap>
                    <span>Old rooms first</span>
                  </Typography>
                </MenuItem>
                <ListSubheader>Order by count of participants</ListSubheader>
                <MenuItem selected={selectedOrdering === 'count_of_participants'} onClick={handleSelectOrdering('count_of_participants')}>
                  <Typography noWrap>
                    <span>Empty rooms first</span>
                  </Typography>
                </MenuItem>
                <MenuItem selected={selectedOrdering === '-count_of_participants'} onClick={handleSelectOrdering('-count_of_participants')}>
                  <Typography noWrap>
                    <span>Filled rooms first</span>
                  </Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Grid>
        </Grid>
        <Grid container justifyContent="center" mt={4}>
          {pageCount !== 0 && (
          <Pagination
            shape="rounded"
            size={underSm ? 'small' : 'medium'}
            count={pageCount}
            page={page}
            renderItem={(item) => <LightPaginationItem {...item} />}
            onChange={handleSelectPage}
          />
          )}
        </Grid>
      </Grid>
    </div>
  );
};

export default Panel;
