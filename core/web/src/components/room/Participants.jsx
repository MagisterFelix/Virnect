import React, { useState } from 'react';

import {
  Avatar,
  Badge,
  Box,
  IconButton,
  Link,
  List,
  ListItem,
  Menu,
  MenuItem,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material';

import {
  AccountCircle,
  FlagCircle,
  RemoveCircle,
} from '@mui/icons-material';

import { useAuth } from '@providers/AuthProvider';
import { useRoom } from '@providers/RoomDataProvider';

import { ReportDialog } from '@utils/Dialogs';
import { OnlineBadge } from '@utils/Styles';

import styles from '@styles/_globals.scss';

const Participants = () => {
  const { profile } = useAuth();

  const { room, kickUser } = useRoom();

  const [selectedUser, setSelectedUser] = useState(null);

  const [anchorElUser, setAnchorElUser] = useState(null);
  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => {
    setSelectedUser(null);
    setAnchorElUser(null);
  };

  const [openReportDialog, setOpenReportDialog] = useState(false);
  const handleOpenReportDialog = () => setOpenReportDialog(true);
  const handleCloseReportDialog = () => {
    setOpenReportDialog(false);
    handleCloseUserMenu();
  };

  const [openTooltip, setOpenTooltip] = useState(null);
  const handleClickUsername = (user) => {
    navigator.clipboard.writeText(`@${user.username}`);
    setOpenTooltip(user);
  };

  return (
    <div className="Participants">
      <Paper
        sx={{
          p: 1,
          bgcolor: styles.color_soft_dark,
          color: styles.color_white,
          borderRadius: 2,
          minHeight: '81.75dvh',
        }}
      >
        <List>
          {room.participants.map((participant) => (
            <ListItem key={participant.id}>
              <IconButton
                onClick={(event) => {
                  setSelectedUser(participant);
                  handleOpenUserMenu(event);
                }}
                sx={{ mb: 1, p: 0 }}
              >
                {participant.id === room.host.id ? (
                  <Badge
                    overlap="circular"
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    badgeContent={(
                      <Box
                        component="img"
                        src="/static/host.svg"
                        alt="host"
                        sx={{
                          mt: -1,
                          mr: -1,
                          height: 20,
                          width: 20,
                          transform: 'rotate(0.125turn)',
                        }}
                      />
                    )}
                  >
                    <OnlineBadge
                      overlap="circular"
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                      }}
                      variant={participant.online ? 'dot' : 'standard'}
                    >
                      <Avatar
                        alt={participant.username}
                        src={participant.image}
                        sx={{
                          height: 50,
                          width: 50,
                        }}
                      />
                    </OnlineBadge>
                  </Badge>
                ) : (
                  <OnlineBadge
                    overlap="circular"
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    variant={participant.online ? 'dot' : 'standard'}
                  >
                    <Avatar
                      alt={participant.username}
                      src={participant.image}
                      sx={{
                        height: 50,
                        width: 50,
                      }}
                    />
                  </OnlineBadge>
                )}
              </IconButton>
              {profile.username !== participant.username && (
              <Menu
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
                open={participant === selectedUser}
                onClose={(event) => {
                  setSelectedUser(null);
                  handleCloseUserMenu(event);
                }}
                sx={{ mt: 1 }}
              >
                <MenuItem>
                  <Link
                    href={`/user/${participant.username}`}
                    underline="none"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      color: styles.color_black,
                    }}
                  >
                    <AccountCircle sx={{ mr: 1 }} />
                    <span style={{ marginTop: 2 }}>Profile</span>
                  </Link>
                </MenuItem>
                <MenuItem onClick={handleOpenReportDialog}>
                  <FlagCircle sx={{ mr: 1 }} />
                  <Typography textAlign="center" sx={{ mt: 0.2 }}>
                    <span>Report</span>
                  </Typography>
                </MenuItem>
                <ReportDialog
                  open={openReportDialog}
                  close={handleCloseReportDialog}
                  user={participant}
                />
                {profile.id === room.host.id && (
                <MenuItem onClick={() => kickUser(participant.id)}>
                  <RemoveCircle sx={{ mr: 1 }} />
                  <Typography textAlign="center" sx={{ mt: 0.2 }}>
                    <span>Kick</span>
                  </Typography>
                </MenuItem>
                )}
              </Menu>
              )}
              <Box
                sx={{
                  mt: -0.5,
                  ml: 2,
                  display: 'flex',
                  alignItems: 'start',
                  flexDirection: 'column',
                }}
              >
                <Typography
                  sx={{
                    fontSize: styles.font_extra_small,
                    color: styles.color_white,
                    fontWeight: 'bold',
                    maxWidth: {
                      xs: '50dvw',
                      lg: '12.5dvw',
                    },
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  <span>
                    {participant.full_name ? participant.full_name : participant.username}
                  </span>
                </Typography>
                <Tooltip
                  title="Copied to clipboard"
                  disableFocusListener
                  disableTouchListener
                  PopperProps={{
                    disablePortal: true,
                  }}
                  open={openTooltip === participant}
                  onClose={() => setOpenTooltip(null)}
                >
                  <Typography
                    sx={{
                      fontSize: styles.font_extra_small,
                      color: styles.color_cyan,
                      fontWeight: 'bold',
                      maxWidth: {
                        xs: '50dvw',
                        lg: '12.5dvw',
                      },
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    <span
                      role="presentation"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleClickUsername(participant)}
                    >
                      {`@${participant.username}`}
                    </span>
                  </Typography>
                </Tooltip>
              </Box>
            </ListItem>
          ))}
        </List>
      </Paper>
    </div>
  );
};

export default Participants;
