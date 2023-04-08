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
  ListSubheader,
  Menu,
  MenuItem,
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

import Language from '@components/main/Language';
import Tag from '@components/main/Tag';
import Topic from '@components/main/Topic';

import { RoomForm } from '@utils/Forms';
import { DropdownButton } from '@utils/Styles';

import styles from '@styles/_globals.scss';

const Panel = () => {
  const [searchParams] = useSearchParams();

  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const handleSearch = (event) => {
    const { value } = event.target;
    setSearchTerm(value);
    if (value) {
      searchParams.set('search', value);
    } else {
      searchParams.delete('search');
    }
    navigate(`?${decodeURIComponent(searchParams.toString())}`);
  };
  const handleClearSearch = () => {
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

  const [selectedExtra, setSelectedExtra] = useState([]);
  const [anchorElExtra, setAnchorElExtra] = useState(null);
  const handleOpenExtra = (event) => setAnchorElExtra(event.currentTarget);
  const handleCloseExtra = () => setAnchorElExtra(null);
  const handleSelectExtra = (value) => () => {
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
    const searchParam = searchParams.get('search');
    if (searchParam !== null) {
      setSearchTerm(searchParam);
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
  }, [searchParams]);

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
            <Topic />
          </Grid>
          <Grid item xs={6} sm={2.5} lg={3}>
            <Language />
          </Grid>
          <Grid item xs={6} sm={3} md={4}>
            <Tag />
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
      </Grid>
    </div>
  );
};

export default Panel;
