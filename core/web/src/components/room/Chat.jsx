import React, { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import {
  Avatar,
  Box,
  Divider,
  IconButton,
  InputBase,
  Link,
  List,
  ListItem,
  Menu,
  MenuItem,
  Paper,
  Typography,
} from '@mui/material';

import {
  Close,
  Delete,
  Edit,
  Reply,
  Send,
} from '@mui/icons-material';

import { useAuth } from '@providers/AuthProvider';
import { useRoom } from '@providers/RoomDataProvider';

import { ConfirmationDialog } from '@utils/Dialogs';
import { getFormattedDateTime, getFormattedTime } from '@utils/Time';

import styles from '@styles/_globals.scss';

const Chat = () => {
  document.addEventListener('contextmenu', (event) => event.preventDefault());

  const [searchParams] = useSearchParams();

  const location = useLocation();
  const navigate = useNavigate();

  const { profile } = useAuth();

  const {
    messages, sendMessage, editMessage, deleteMessage,
  } = useRoom();

  const messagesRef = useRef(null);

  useEffect(() => {
    const messagesElement = messagesRef.current;
    if (messagesElement.scrollTop >= 0) {
      messagesElement.scrollTop = 0;
    }
  }, [messages]);

  const [selectedMessage, setSelectedMessage] = useState(null);
  const [type, setType] = useState(null);

  const { control, handleSubmit, reset } = useForm();
  const handleOnSubmit = async (form) => {
    if (form.message.trim().length === 0) {
      reset({ message: '' });
      return;
    }
    const formData = {
      text: form.message.trim(),
    };
    if (type === 'replying') {
      formData.reply_to = selectedMessage.id;
      await sendMessage(formData);
      messagesRef.current.scrollTop = 0;
    } else if (type === 'editing') {
      if (formData.text !== selectedMessage.text) {
        await editMessage(selectedMessage, formData);
      }
    } else {
      await sendMessage(formData);
      messagesRef.current.scrollTop = 0;
    }
    reset({ message: '' });
    setSelectedMessage(null);
    setType(null);
  };

  const [contextMenu, setContextMenu] = useState(null);
  const handleOpenContextMenu = (event) => {
    event.preventDefault();
    reset({ message: '' });
    setType(null);
    setContextMenu(
      contextMenu === null
        ? {
          mouseX: event.clientX + 2,
          mouseY: event.clientY - 6,
        } : null,
    );
  };
  const handleCloseContextMenu = () => setContextMenu(null);

  const handleShowSelectedMessage = (selectedType) => {
    reset({ message: selectedType === 'editing' ? selectedMessage.text : '' });
    setType(selectedType);
    handleCloseContextMenu();
  };
  const handleHideSelectedMessage = () => {
    reset({ message: '' });
    setSelectedMessage(null);
    setType(null);
  };

  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus();
    if (type === 'editing' && inputRef.current && inputRef.current.value !== '') {
      inputRef.current.setSelectionRange(
        inputRef.current.value.length,
        inputRef.current.value.length,
      );
    }
  }, [type]);

  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
  const handleOnDelete = async (message) => {
    await deleteMessage(message);
  };
  const handleOpenConfirmationDialog = () => setOpenConfirmationDialog(true);
  const handleCloseConfirmationDialog = () => {
    setOpenConfirmationDialog(false);
    handleCloseContextMenu();
  };

  const scrollToMessage = (messageId) => {
    const messagesElement = messagesRef.current;
    const message = messagesElement.querySelector(`[data-message-id="${messageId}"]`);
    message.scrollIntoView({ block: 'center' });
    message.style.animation = '';
    message.style.animation = 'fade-in-out-outline 1.5s forwards';
    setTimeout(() => { message.style.animation = ''; }, 1500);
  };

  useEffect(() => {
    const message = searchParams.get('message');
    if (message) {
      const scrollTo = messages.find((msg) => msg.id === parseInt(message, 10));
      if (scrollTo) {
        scrollToMessage(scrollTo.id);
      }
      navigate(location.pathname, { replace: true });
    }
  }, []);

  return (
    <div className="Chat">
      <Paper
        sx={{
          p: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          bgcolor: styles.color_soft_dark,
          color: styles.color_white,
          borderRadius: 2,
          height: '50dvh',
        }}
      >
        {messages.length === 0 && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <Box
            component="img"
            src="/static/nothing.svg"
            alt="empty"
            width={{ xs: '55%', md: '28.5%' }}
          />
          <Typography
            sx={{
              my: 2,
              fontSize: {
                xs: styles.font_small,
                sm: styles.font_large,
              },
              fontWeight: 'bold',
              color: styles.color_white,
            }}
          >
            <span>No one has left a message yet...</span>
          </Typography>
        </Box>
        )}
        <Box
          ref={messagesRef}
          sx={{
            display: 'flex',
            flexDirection: 'column-reverse',
            overflowY: 'auto',
          }}
        >
          <List>
            {messages.map((message, index) => (
              <ListItem
                key={message.id}
                sx={{
                  display: 'flex',
                  alignItems: 'end',
                }}
              >
                {(index + 1 === messages.length
                || message.author.id !== messages[index + 1].author.id) ? (
                  <Link
                    href={`/user/${message.author.username}`}
                    underline="none"
                    sx={{ mr: 1 }}
                  >
                    <Avatar
                      alt={message.author.username}
                      src={message.author.image}
                      sx={{
                        height: 44,
                        width: 44,
                      }}
                    />
                  </Link>
                  ) : <Box sx={{ mr: 6.5 }} />}
                <Paper
                  data-message-id={message.id}
                  onContextMenu={(event) => {
                    setSelectedMessage(message);
                    handleOpenContextMenu(event);
                  }}
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: styles.color_dark,
                    color: styles.color_white,
                    borderRadius: 2,
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      display: 'flex',
                      alignItems: 'start',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography
                      sx={{
                        mb: 1,
                        mr: message.updated_at && 3,
                        color: profile.id === message.author.id
                          ? styles.color_yellow
                          : styles.color_blue,
                        fontWeight: 'bold',
                        maxWidth: '35dvw',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {message.author.full_name
                        ? message.author.full_name
                        : message.author.username}
                    </Typography>
                    {message.updated_at && (
                    <Typography
                      sx={{
                        color: styles.color_grey,
                      }}
                    >
                      <span title={getFormattedTime(message.updated_at)} style={{ cursor: 'default' }}>
                        edited
                      </span>
                    </Typography>
                    )}
                  </Box>
                  {message.reply_to && (
                  <Box
                    onClick={() => scrollToMessage(message.reply_to.id)}
                    sx={{
                      mb: 1,
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <Divider
                      orientation="vertical"
                      flexItem
                      sx={{
                        mr: 1,
                        borderLeftWidth: 2,
                        bgcolor: styles.color_neon,
                      }}
                    />
                    <Typography component="span" sx={{ wordBreak: 'break-word' }}>
                      <Typography
                        sx={{
                          color: styles.color_white,
                          fontWeight: 'bold',
                        }}
                      >
                        {message.reply_to.author.full_name
                          ? message.reply_to.author.full_name
                          : message.reply_to.author.username}
                      </Typography>
                      <Typography
                        sx={{
                          mr: 2,
                          wordBreak: 'break-word',
                        }}
                      >
                        {message.reply_to.short_message.split(/(@\w+)/g).filter((text) => text !== '').map((text) => {
                          if (/@\w+/.test(text)) {
                            return (
                              <span
                                key={text + message.reply_to.id}
                                style={{
                                  color: text.slice(1) === profile.username
                                    ? styles.color_red
                                    : styles.color_cyan,
                                  fontWeight: 'bold',
                                }}
                              >
                                {text}
                              </span>
                            );
                          }
                          return (
                            <span key={text + message.reply_to.id}>
                              {text}
                            </span>
                          );
                        })}
                      </Typography>
                    </Typography>
                  </Box>
                  )}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'end',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography
                      sx={{
                        mr: 2,
                        minWidth: {
                          xs: 0,
                          sm: '8dvw',
                        },
                        maxWidth: '85%',
                        wordBreak: 'break-word',
                      }}
                    >
                      {message.text.split(/(@\w+)/g).filter((text) => text !== '').map((text) => {
                        if (/@\w+/.test(text)) {
                          return (
                            <Link
                              key={text + message.id}
                              href={`/user/${text.slice(1)}`}
                              underline="none"
                              sx={{
                                color: text.slice(1) === profile.username
                                  ? styles.color_red
                                  : styles.color_cyan,
                                fontWeight: 'bold',
                              }}
                            >
                              {text}
                            </Link>
                          );
                        }
                        return (
                          <span key={text + message.id}>
                            {text}
                          </span>
                        );
                      })}
                    </Typography>
                    <Typography textAlign="right" sx={{ color: styles.color_grey }}>
                      <span>
                        {getFormattedDateTime(message.created_at)}
                      </span>
                    </Typography>
                  </Box>
                </Paper>
                <Menu
                  disableAutoFocusItem
                  open={contextMenu !== null && selectedMessage === message}
                  onClose={handleCloseContextMenu}
                  anchorReference="anchorPosition"
                  anchorPosition={contextMenu !== null
                    ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                    : undefined}
                >
                  <MenuItem onClick={() => handleShowSelectedMessage('replying')}>
                    <Typography
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        color: styles.color_black,
                      }}
                    >
                      <Reply fontSize="small" sx={{ mr: 1 }} />
                      <span>Reply</span>
                    </Typography>
                  </MenuItem>
                  {profile.id === message.author.id && (
                  <MenuItem onClick={() => handleShowSelectedMessage('editing')}>
                    <Typography
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        color: styles.color_black,
                      }}
                    >
                      <Edit fontSize="small" sx={{ mr: 1 }} />
                      <span>Edit</span>
                    </Typography>
                  </MenuItem>
                  )}
                  {profile.id === message.author.id && (
                    <MenuItem onClick={handleOpenConfirmationDialog}>
                      <Typography
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          color: styles.color_black,
                        }}
                      >
                        <Delete fontSize="small" sx={{ mr: 1 }} />
                        <span>Delete</span>
                      </Typography>
                    </MenuItem>
                  )}
                  <ConfirmationDialog
                    open={openConfirmationDialog}
                    close={handleCloseConfirmationDialog}
                    message="Are you sure you want to delete this message?"
                    onConfirm={() => handleOnDelete(message)}
                  />
                </Menu>
              </ListItem>
            ))}
          </List>
        </Box>
        <Box>
          {type !== null && selectedMessage !== null && (
          <Paper
            sx={{
              p: 2,
              mt: 2,
              mx: 1,
              mb: -2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: styles.color_white,
              bgcolor: styles.color_dark,
              borderRadius: 1,
              minHeight: 40,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {type === 'editing'
                ? <Edit fontSize="small" sx={{ mr: 1, color: styles.color_neon }} />
                : <Reply fontSize="small" sx={{ mr: 1, color: styles.color_neon }} />}
              <Divider
                orientation="vertical"
                flexItem
                sx={{
                  mr: 1,
                  borderLeftWidth: 2,
                  bgcolor: styles.color_neon,
                }}
              />
              <Typography component="span" sx={{ wordBreak: 'break-word' }}>
                <span>{selectedMessage.text}</span>
              </Typography>
            </Box>
            <IconButton
              onClick={handleHideSelectedMessage}
              sx={{
                mr: -1,
                color: styles.color_white,
              }}
            >
              <Close />
            </IconButton>
          </Paper>
          )}
          <Box
            component="form"
            autoComplete="off"
            sx={{
              p: 1,
              m: 1,
              display: 'flex',
              alignItems: 'center',
              bgcolor: styles.color_dark,
              borderRadius: 1,
              minHeight: 44,
            }}
          >
            <Controller
              name="message"
              control={control}
              defaultValue=""
              rules={{
                required: true,
              }}
              render={({ field: { onChange, value } }) => (
                <>
                  <InputBase
                    onChange={(event) => {
                      if (event.target.value.length <= 512) {
                        onChange(event);
                        if (type === 'editing' && event.target.value === '') {
                          handleHideSelectedMessage();
                        }
                      }
                    }}
                    value={value}
                    multiline
                    fullWidth
                    inputRef={inputRef}
                    placeholder="Write a message..."
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        handleSubmit(handleOnSubmit)();
                      }
                    }}
                    sx={{
                      pl: 1,
                      color: styles.color_white,
                    }}
                  />
                  <IconButton
                    onClick={handleSubmit(handleOnSubmit)}
                    sx={{ color: styles.color_white }}
                  >
                    <Send />
                  </IconButton>
                </>
              )}
            />
          </Box>
        </Box>
      </Paper>
    </div>
  );
};

export default Chat;
