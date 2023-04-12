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

import getFormattedTime from '@utils/Time';

import styles from '@styles/_globals.scss';

const Notification = (notification, viewNotification) => {
  const {
    id, notification_type: type, content, is_viewed: isViewed, created_at: createdAt,
  } = notification;

  const viewButton = (
    <IconButton onClick={() => viewNotification(id, true)} sx={{ ml: 0.5 }}>
      <Visibility sx={{ color: styles.color_neon }} />
    </IconButton>
  );

  if (type === 0) {
    const { user, room } = content;
    return (
      <>
        <Typography component="span" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <Chat sx={{ pr: 2, color: styles.color_blue }} />
            <span>
              <Link
                href={`/user/${user.username}`}
                underline="none"
                fontWeight="bold"
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
              >
                {room.title}
              </Link>
              {' '}
              room.
            </span>
          </span>
          {!isViewed && viewButton}
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
  }
  if (type === 1) {
    const { report } = content;
    return (
      <>
        <Typography component="span" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <Feedback sx={{ pr: 2, color: styles.color_blue }} />
            <span>
              Your complaint against the user
              {' '}
              <Link
                href={`/user/${report.accused.username}`}
                underline="none"
                fontWeight="bold"
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
          </span>
          {!isViewed && viewButton}
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
  }
  if (type === 2) {
    const { report } = content;
    return (
      <>
        <Typography component="span" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center' }}>
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
          </span>
          {!isViewed && viewButton}
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
  }
  if (type === 3) {
    const { user, room, message } = content;
    return (
      <>
        <Typography component="span" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <Reply sx={{ pr: 2, color: styles.color_blue }} />
            <span>
              <Link
                href={`/user/${user.username}`}
                underline="none"
                fontWeight="bold"
              >
                @
                {user.username}
              </Link>
              {' '}
              replied to your
              {' '}
              «
              {message.text}
              »
              {' '}
              message in the
              {' '}
              <Link
                href={`/room/${room.title}`}
                underline="none"
                fontWeight="bold"
              >
                {room.title}
              </Link>
              {' '}
              room.
            </span>
          </span>
          {!isViewed && viewButton}
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
  }
  if (type === 4) {
    const { promoted } = content;
    return (
      <>
        <Typography component="span">
          {promoted
            ? (
              <Typography component="span" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <AddModerator sx={{ pr: 2, color: styles.color_green }} />
                  <span>
                    Congratulations!
                    You have received moderator rights.
                    We look forward to seeing you at work!
                  </span>
                </span>
                {!isViewed && viewButton}
              </Typography>
            )
            : (
              <Typography component="span" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <RemoveModerator sx={{ pr: 2, color: styles.color_red }} />
                  <span>
                    We regret to inform you that you have been terminated as a moderator.
                    Good luck on the way!
                  </span>
                </span>
                {!isViewed && viewButton}
              </Typography>
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
  }
  return (
    <Typography component="span">
      <span>Invalid notification.</span>
    </Typography>
  );
};

export default Notification;
