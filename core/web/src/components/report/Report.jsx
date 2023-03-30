import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import {
  Alert,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  Menu,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';

import { LoadingButton } from '@mui/lab';

import {
  Close,
  FlagCircle,
  Send,
} from '@mui/icons-material';

import useAxios from '@api/axios';
import ENDPOINTS from '@api/endpoints';

import './Report.scss';

const Report = ({
  profile, user, anchorElUser, setAnchorElUser,
}) => {
  const [{ loading: loadingReportOptions, data: reportOptions }] = useAxios(
    {
      url: ENDPOINTS.report,
      method: 'OPTIONS',
    },
  );

  const validation = {
    reason: {
      required: 'This field may not be blank',
    },
  };

  const [{ loading: loadingReport }, sendReport] = useAxios(
    {
      url: ENDPOINTS.report,
      method: 'POST',
    },
    {
      manual: true,
    },
  );

  const [alert, setAlert] = useState(null);
  const { control, handleSubmit, reset } = useForm();
  const handleOnSubmit = async (form) => {
    const formData = {
      sender: profile.id,
      suspect: user.id,
      ...form,
    };
    setAlert(null);
    try {
      const response = await sendReport({
        method: 'POST',
        data: formData,
      });
      setAlert({ type: 'success', message: response.data.details });
    } catch (err) {
      setAlert({ type: 'error', message: 'Something went wrong...' });
    }
  };

  const [openReportDialog, setOpenReportDialog] = useState(false);
  const handleOpenReportDialog = () => {
    setAnchorElUser(null);
    reset();
    setAlert(null);
    setOpenReportDialog(true);
  };
  const handleCloseReportDialog = () => { setOpenReportDialog(false); };

  return (
    <div className="Report">
      <Menu
        sx={{ mt: 2 }}
        anchorEl={anchorElUser}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        open={Boolean(anchorElUser)}
        onClose={() => setAnchorElUser(null)}
      >
        <MenuItem onClick={handleOpenReportDialog}>
          <FlagCircle sx={{ marginRight: 1 }} />
          <Typography textAlign="center">Report</Typography>
        </MenuItem>
      </Menu>
      <Dialog open={openReportDialog} onClose={handleCloseReportDialog} fullWidth>
        <Box component="form" autoComplete="off">
          <DialogTitle sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
          >
            <span>Report</span>
            <IconButton
              aria-label="close"
              sx={{ marginRight: -1 }}
              onClick={handleCloseReportDialog}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Controller
              name="reason"
              control={control}
              defaultValue=""
              rules={{
                required: true,
              }}
              render={({
                field: { onChange, value },
                fieldState: { error: fieldError },
              }) => (
                <TextField
                  onChange={onChange}
                  value={value}
                  required
                  fullWidth
                  select
                  margin="dense"
                  label="Reason"
                  SelectProps={{
                    MenuProps: {
                      style: {
                        maxHeight: 190,
                      },
                    },
                  }}
                  error={fieldError !== undefined}
                  helperText={fieldError ? fieldError.message || validation.reason[fieldError.type] : ''}
                >
                  {
                    loadingReportOptions
                      ? (<LinearProgress sx={{ margin: 2 }} />)
                      : (reportOptions.actions.POST.reason.choices.map(
                        (choice) => (
                          <MenuItem key={choice.value} value={choice.value}>
                            {choice.display_name}
                          </MenuItem>
                        ),
                      ))
                    }
                </TextField>
              )}
            />
            {alert && <Alert severity={alert.type} sx={{ textAlign: 'left', mt: 1 }}>{alert.message}</Alert>}
          </DialogContent>
          <DialogActions sx={{ marginX: 1 }}>
            <LoadingButton
              loading={loadingReport}
              onClick={handleSubmit(handleOnSubmit)}
              endIcon={<Send />}
            >
              Send
            </LoadingButton>
          </DialogActions>
        </Box>
      </Dialog>
    </div>
  );
};

export default Report;
