import React from 'react';

import {
  IconButton,
  Link,
  Typography,
} from '@mui/material';

import {
  AddModerator,
  Chat,
  Feedback,
  RemoveModerator,
  Reply,
  Visibility,
  Warning,
} from '@mui/icons-material';

import { getFormattedTime } from '@utils/Time';

import styles from '@styles/_globals.scss';

const BaseNotification = ({ notification, updateNotification, children }) => {
  const { is_viewed: isViewed, created_at: createdAt } = notification;

  return (
    <>
      <Typography component="span" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ display: 'flex', alignItems: 'center' }}>
          {children}
        </span>
        {!isViewed && (
        <IconButton onClick={updateNotification} sx={{ ml: 0.5 }}>
          <Visibility sx={{ color: styles.color_neon }} />
        </IconButton>
        )}
      </Typography>
      <Typography
        component="span"
        sx={{
          mt: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'end',
        }}
      >
        {getFormattedTime(createdAt)}
      </Typography>
    </>
  );
};

const Notification = (notification, viewNotification) => {
  const {
    id, notification_type: type, content, is_viewed: isViewed,
  } = notification;

  const updateNotification = async () => {
    if (!isViewed) {
      await viewNotification(id);
    }
  };

  if (type === 0) {
    const { user, room } = content;
    return (
      <BaseNotification notification={notification} updateNotification={updateNotification}>
        <Chat sx={{ pr: 2, color: styles.color_blue }} />
        <span>
          <Link
            href={`/user/${user.username}`}
            underline="none"
            fontWeight="bold"
            onClick={updateNotification}
          >
            @
            {user.username}
          </Link>
          {' '}
          mentioned you in the
          {' '}
          <Link
            href={`/room/${room.title}`}
            underline="none"
            fontWeight="bold"
            onClick={updateNotification}
          >
            {room.title}
          </Link>
          {' '}
          room.
        </span>
      </BaseNotification>
    );
  }
  if (type === 1) {
    const { report } = content;
    return (
      <BaseNotification notification={notification} updateNotification={updateNotification}>
        <Feedback sx={{ pr: 2, color: styles.color_blue }} />
        <span>
          Your complaint against the user
          {' '}
          <Link
            href={`/user/${report.accused.username}`}
            underline="none"
            fontWeight="bold"
            onClick={updateNotification}
          >
            @
            {report.accused.username}
          </Link>
          {' '}
          regarding
          {' '}
          «
          <b>{report.reason}</b>
          »
          {' '}
          has been reviewed and action taken.
        </span>
      </BaseNotification>
    );
  }
  if (type === 2) {
    const { report } = content;
    return (
      <BaseNotification notification={notification} updateNotification={updateNotification}>
        <Warning sx={{ pr: 2, color: styles.color_yellow }} />
        <span>
          You have received complaints for
          {' '}
          «
          <b>{report.reason}</b>
          ».
          {' '}
          You should pay attention to this, otherwise, you will be blocked.
        </span>
      </BaseNotification>
    );
  }
  if (type === 3) {
    const { user, room, message } = content;
    return (
      <BaseNotification notification={notification} updateNotification={updateNotification}>
        <Reply sx={{ pr: 2, color: styles.color_blue }} />
        <span>
          <Link
            href={`/user/${user.username}`}
            underline="none"
            fontWeight="bold"
            onClick={updateNotification}
          >
            @
            {user.username}
          </Link>
          {' '}
          replied to your
          {' '}
          «
          <Link
            href={`/room/${room.title}?message=${message.id}`}
            underline="none"
            onClick={updateNotification}
          >
            {message.reply_to.short_message}
          </Link>
          »
          {' '}
          message in the
          {' '}
          <Link
            href={`/room/${room.title}`}
            underline="none"
            fontWeight="bold"
            onClick={updateNotification}
          >
            {room.title}
          </Link>
          {' '}
          room.
        </span>
      </BaseNotification>
    );
  }
  if (type === 4) {
    const { promoted } = content;
    return (
      <BaseNotification notification={notification} updateNotification={updateNotification}>
        {promoted
          ? (
            <>
              <AddModerator sx={{ pr: 2, color: styles.color_green }} />
              <span>
                Congratulations!
                You have received moderator rights.
                We look forward to seeing you at work!
              </span>
            </>
          )
          : (
            <>
              <RemoveModerator sx={{ pr: 2, color: styles.color_red }} />
              <span>
                We regret to inform you that you have been terminated as a moderator.
                Good luck on the way!
              </span>
            </>
          )}
      </BaseNotification>
    );
  }
  return null;
};

export default Notification;
