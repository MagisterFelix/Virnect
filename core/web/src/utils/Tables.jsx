import React, { useCallback, useEffect, useState } from 'react';

import {
  Box,
  Checkbox,
  Chip,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';

import {
  AddCircle,
  Cancel,
  CheckCircle,
  Clear,
  Delete,
  Edit,
  Search,
} from '@mui/icons-material';

import { alpha } from '@mui/material/styles';

import { visuallyHidden } from '@mui/utils';

import useAxios from '@api/axios';

import { ConfirmationDialog } from '@utils/Dialogs';

const EnhancedTable = ({
  variant, title, rowsPerPage,
  fields, initialData, endpoint, refetchData,
  Dialog,
  searchBy, canAdd, canEdit, canDelete,
}) => {
  const [data, setData] = useState(initialData);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const descendingComparator = (a, b, orderBy) => {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  };

  const getComparator = (order, orderBy) => (
    order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy)
  );

  const stableSort = (array, comparator) => {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) {
        return order;
      }
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  };

  const DEFAULT_ORDER = 'asc';
  const DEFAULT_ORDER_BY = 'id';
  const DEFAULT_ROWS_PER_PAGE = rowsPerPage || 10;

  const [order, setOrder] = useState(DEFAULT_ORDER);
  const [orderBy, setOrderBy] = useState(DEFAULT_ORDER_BY);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleRows, setVisibleRows] = useState(null);
  const [paddingHeight, setPaddingHeight] = useState(0);

  useEffect(() => {
    let rowsOnMount = stableSort(data, getComparator(DEFAULT_ORDER, DEFAULT_ORDER_BY));
    rowsOnMount = rowsOnMount.slice(0, DEFAULT_ROWS_PER_PAGE);
    setVisibleRows(rowsOnMount);
  }, [data]);

  const handleSearch = useCallback(
    (event, value) => {
      setPage(0);
      setPaddingHeight(0);
      setSearchTerm(value);
      const sortedRows = stableSort(data, getComparator(order, orderBy));
      if (value === '') {
        setVisibleRows(sortedRows.slice(0, DEFAULT_ROWS_PER_PAGE));
      } else {
        const updatedRows = sortedRows.filter(
          (item) => item[searchBy].toLowerCase().includes(value.toLowerCase()),
        ).slice(0, DEFAULT_ROWS_PER_PAGE);
        setVisibleRows(updatedRows);
        const numEmptyRows = updatedRows.length < Math.min(data.length, DEFAULT_ROWS_PER_PAGE)
          ? Math.min(data.length, DEFAULT_ROWS_PER_PAGE) - updatedRows.length
          : 0;
        const newPaddingHeight = 43 * numEmptyRows;
        setPaddingHeight(newPaddingHeight);
      }
    },
    [data, order, orderBy],
  );

  const handleRequestSort = useCallback(
    (event, newOrderBy) => {
      const isAsc = orderBy === newOrderBy && order === 'asc';
      const toggledOrder = isAsc ? 'desc' : 'asc';
      setOrder(toggledOrder);
      setOrderBy(newOrderBy);
      const sortedRows = stableSort(data, getComparator(toggledOrder, newOrderBy));
      const updatedRows = sortedRows.slice(
        page * DEFAULT_ROWS_PER_PAGE,
        page * DEFAULT_ROWS_PER_PAGE + DEFAULT_ROWS_PER_PAGE,
      );
      setVisibleRows(updatedRows);
    },
    [data, order, orderBy, page],
  );

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = data.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = useCallback(
    (event, newPage) => {
      setPage(newPage);
      const sortedRows = stableSort(data, getComparator(order, orderBy));
      const updatedRows = sortedRows.slice(
        newPage * DEFAULT_ROWS_PER_PAGE,
        newPage * DEFAULT_ROWS_PER_PAGE + DEFAULT_ROWS_PER_PAGE,
      );
      setVisibleRows(updatedRows);
      const numEmptyRows = newPage > 0
        ? Math.max(0, (1 + newPage) * DEFAULT_ROWS_PER_PAGE - data.length)
        : 0;
      const newPaddingHeight = 43 * numEmptyRows;
      setPaddingHeight(newPaddingHeight);
    },
    [data, order, orderBy],
  );

  const isSelected = (name) => selected.indexOf(name) !== -1;

  const [openDialog, setOpenDialog] = useState(false);
  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  const [, execute] = useAxios(
    {
      method: 'DELETE',
    },
    {
      manual: true,
      autoCancel: false,
    },
  );

  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
  const handleOpenConfirmationDialog = () => setOpenConfirmationDialog(true);
  const handleOnDelete = async () => {
    const getURL = (id) => {
      if (title === 'Room') {
        return `${endpoint}${data.find((room) => room.id === id).title}/`;
      }
      if (title === 'User') {
        return `${endpoint}${data.find((user) => user.id === id).username}/`;
      }
      return `${endpoint}${id}/`;
    };
    const promises = selected.map((id) => execute({
      url: getURL(id),
    }));
    await Promise.all(promises);
    await refetchData();
    setSelected([]);
  };
  const handleCloseConfirmationDialog = () => setOpenConfirmationDialog(false);

  return (
    <Box sx={{ width: '100%' }}>
      <Paper variant={variant || 'elevation'} sx={{ width: '100%' }}>
        <Toolbar
          sx={{
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 },
            ...(selected.length > 0 && {
              bgcolor: (theme) => alpha(
                theme.palette.primary.main,
                theme.palette.action.activatedOpacity,
              ),
            }),
          }}
        >
          {selected.length > 0 ? (
            <Typography
              sx={{ flex: '1 1 100%' }}
              color="inherit"
              variant="subtitle1"
              component="div"
            >
              {selected.length}
              {' '}
              selected
            </Typography>
          ) : (
            <Typography
              sx={{ flex: '1 1 100%' }}
              variant="h6"
              id="tableTitle"
              component="div"
              fontWeight="bold"
            >
              <span>
                {title}
                s
              </span>
            </Typography>
          )}
          {selected.length !== 0
            ? (
              <>
                {canEdit && selected.length === 1 && (
                  <>
                    <Tooltip title="Edit">
                      <IconButton onClick={handleOpenDialog}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Dialog
                      open={openDialog}
                      close={handleCloseDialog}
                      instance={data.find((instance) => instance.id === selected[0])}
                    />
                  </>
                )}
                {canDelete && (
                <>
                  <Tooltip title="Delete">
                    <IconButton onClick={handleOpenConfirmationDialog}>
                      <Delete />
                    </IconButton>
                  </Tooltip>
                  <ConfirmationDialog
                    open={openConfirmationDialog}
                    close={handleCloseConfirmationDialog}
                    message={`Are you sure you want to delete the «${data.filter(
                      (instance) => selected.includes(instance.id),
                    ).map(
                      (instance) => (instance.username ? instance.username : instance.title),
                    ).join(', ')}» ${title.toLowerCase()}${selected.length > 1 ? 's' : ''}?`}
                    onConfirm={handleOnDelete}
                  />
                </>
                )}
              </>
            ) : (
              canAdd && (
              <>
                <Tooltip title="Add">
                  <IconButton onClick={handleOpenDialog}>
                    <AddCircle />
                  </IconButton>
                </Tooltip>
                <Dialog
                  open={openDialog}
                  close={handleCloseDialog}
                />
              </>
              )
            )}
        </Toolbar>
        <TextField
          placeholder={`Search by ${searchBy}...`}
          size="small"
          value={searchTerm}
          onChange={(event) => handleSearch(event, event.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {searchTerm
                  ? (
                    <IconButton size="small" onClick={(event) => handleSearch(event, '')}>
                      <Clear fontSize="small" />
                    </IconButton>
                  ) : (
                    <IconButton size="small">
                      <Search fontSize="small" />
                    </IconButton>
                  )}
              </InputAdornment>
            ),
          }}
          sx={{
            m: 2,
          }}
        />
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size="medium"
          >
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    indeterminate={selected.length > 0 && selected.length < data.length}
                    checked={data.length > 0 && selected.length === data.length}
                    onChange={handleSelectAllClick}
                    inputProps={{
                      'aria-label': 'select all desserts',
                    }}
                  />
                </TableCell>
                {fields.map((field) => (
                  <TableCell
                    key={field.id}
                    align="left"
                    padding="none"
                    sortDirection={orderBy === field.id ? order : false}
                  >
                    <TableSortLabel
                      active={orderBy === field.id}
                      direction={orderBy === field.id ? order : 'asc'}
                      onClick={(event) => handleRequestSort(event, field.id)}
                    >
                      {field.label}
                      {orderBy === field.id ? (
                        <Box component="span" sx={visuallyHidden}>
                          {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                        </Box>
                      ) : null}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleRows
                ? visibleRows.map((row, index) => (
                  <TableRow
                    hover
                    onClick={(event) => handleClick(event, row.id)}
                    role="checkbox"
                    aria-checked={isSelected(row.id)}
                    tabIndex={-1}
                    key={row.id}
                    selected={isSelected(row.id)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isSelected(row.id)}
                        inputProps={{
                          'aria-labelledby': `enhanced-table-checkbox-${index}`,
                        }}
                      />
                    </TableCell>
                    <TableCell
                      component="th"
                      id={`enhanced-table-checkbox-${index}`}
                      scope="row"
                      padding="none"
                    >
                      {row.id}
                    </TableCell>
                    {Object.entries((({ id, ...cols }) => cols)(row)).map(
                      (col, colIndex) => {
                        const { type } = fields[colIndex + 1];
                        if (type === 'integer') {
                          return (
                            <TableCell key={`${row.id}-${col[0]}-${col[1]}`} align="left" padding="none">
                              {col[1]}
                            </TableCell>
                          );
                        }
                        if (type === 'boolean') {
                          return (
                            <TableCell key={`${row.id}-${col[0]}-${col[1]}`} align="left" padding="none">
                              {col[1] ? <CheckCircle color="success" /> : <Cancel color="error" />}
                            </TableCell>
                          );
                        }
                        if (type === 'choice') {
                          return (
                            <TableCell key={`${row.id}-${col[0]}-${col[1]}`} align="left" padding="none">
                              {col[1][1]}
                            </TableCell>
                          );
                        }
                        if (type === 'array') {
                          return (
                            <TableCell key={`${row.id}-${col[0]}-${col[1]}`} align="left" padding="none">
                              {col[1].map((item) => (
                                <Chip
                                  key={item.id}
                                  label={item.username ? item.username : item.name}
                                  color="primary"
                                  size="small"
                                  sx={{ m: 0.5 }}
                                />
                              ))}
                            </TableCell>
                          );
                        }
                        if (type === 'image') {
                          return (
                            <TableCell key={`${row.id}-${col[0]}-${col[1]}`} align="left" padding="none">
                              <Box
                                component="img"
                                src={col[1]}
                                alt={col[1]}
                                width={24}
                              />
                            </TableCell>
                          );
                        }
                        if (type === 'datetime') {
                          return (
                            <TableCell key={`${row.id}-${col[0]}-${col[1]}`} align="left" padding="none">
                              {col[1] && new Date(col[1]).toLocaleString('en-GB')}
                            </TableCell>
                          );
                        }
                        return (
                          <TableCell key={`${row.id}-${col[0]}-${col[1]}`} align="left" padding="none" sx={{ wordBreak: 'break-word' }}>
                            {col[1]}
                          </TableCell>
                        );
                      },
                    )}
                  </TableRow>
                )) : null}
              {paddingHeight > 0 && (
                <TableRow
                  style={{
                    height: paddingHeight,
                  }}
                >
                  <TableCell colSpan={fields.length + 1} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={data.length}
          rowsPerPageOptions={[]}
          rowsPerPage={DEFAULT_ROWS_PER_PAGE}
          page={page}
          onPageChange={handleChangePage}
        />
      </Paper>
    </Box>
  );
};

export default EnhancedTable;
