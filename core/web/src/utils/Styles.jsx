import React from 'react';

import {
  Badge,
  Button,
  TextField,
  Tooltip,
  tooltipClasses,
} from '@mui/material';

import { styled } from '@mui/material/styles';

import styles from '@styles/_globals.scss';

const OnlineBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: styles.color_green,
    color: styles.color_green,
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: -1,
      left: -1,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

const outline = (user) => {
  if (user.is_superuser) {
    return `3px solid ${styles.color_red}`;
  }
  if (user.is_staff) {
    return `3px solid ${styles.color_yellow}`;
  }
  return `3px solid ${styles.color_blue}`;
};

const LightTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.white,
    color: 'rgba(0, 0, 0, 0.87)',
    boxShadow: theme.shadows[1],
    fontSize: 11,
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.common.white,
    border: 0,
  },
}));

const DropdownTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    '&:hover': {
      background: styles.color_soft_grey,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderWidth: 0,
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderWidth: 0,
    },
  },
});

const DropdownButton = styled(Button)({
  '&:hover': {
    background: styles.color_dark_grey,
  },
});

export {
  OnlineBadge, outline, LightTooltip, DropdownTextField, DropdownButton,
};
