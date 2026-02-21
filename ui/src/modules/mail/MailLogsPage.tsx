import React, { useEffect, useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import TablePagination from '@mui/material/TablePagination';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import AppBreadcrumb from '../../components/AppBreadcrumb';
import { mailApi, MailLog } from '../../api/mailApi';
import { useToast } from '../../hooks/useToast';

const statusColors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  delivered: 'success',
  sent: 'success',
  queued: 'info',
  deferred: 'warning',
  bounced: 'error',
  rejected: 'error',
  received: 'info',
};

const MailLogsPage: React.FC = () => {
  const { showToast } = useToast();
  const [logs, setLogs] = useState<MailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [direction, setDirection] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await mailApi.getLogs({
        page: page + 1,
        limit: rowsPerPage,
        search: search || undefined,
        direction: direction || undefined,
        status: status || undefined,
        sortBy,
        sortOrder,
      });
      setLogs(data.data.logs || []);
      setTotal(data.data.total);
    } catch {
      showToast('Failed to load mail logs', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, direction, status, sortBy, sortOrder, showToast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSort = (field: string) => {
    setSortBy(field);
    setSortOrder(sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <Box>
      <AppBreadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Mail Logs' }]} />
      <Typography variant="h4" gutterBottom>
        Mail Logs
      </Typography>

      <Grid container spacing={2} mb={2}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4 }}>
          <TextField
            fullWidth
            select
            size="small"
            label="Direction"
            value={direction}
            onChange={(e) => {
              setDirection(e.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="inbound">Inbound</MenuItem>
            <MenuItem value="outbound">Outbound</MenuItem>
          </TextField>
        </Grid>
        <Grid size={{ xs: 6, sm: 4 }}>
          <TextField
            fullWidth
            select
            size="small"
            label="Status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="delivered">Delivered</MenuItem>
            <MenuItem value="bounced">Bounced</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
            <MenuItem value="queued">Queued</MenuItem>
            <MenuItem value="deferred">Deferred</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === 'createdAt'}
                      direction={sortBy === 'createdAt' ? sortOrder : 'asc'}
                      onClick={() => handleSort('createdAt')}
                    >
                      Date
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Direction</TableCell>
                  <TableCell>From</TableCell>
                  <TableCell>To</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>TLS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography color="text.secondary" py={4}>
                        No mail logs found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log._id} hover>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {new Date(log.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={log.direction}
                          size="small"
                          color={log.direction === 'inbound' ? 'info' : 'secondary'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell
                        sx={{
                          maxWidth: 180,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {log.from}
                      </TableCell>
                      <TableCell
                        sx={{
                          maxWidth: 180,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {log.to}
                      </TableCell>
                      <TableCell
                        sx={{
                          maxWidth: 200,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {log.subject}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={log.status}
                          size="small"
                          color={statusColors[log.status] || 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        {log.size > 1024 ? `${(log.size / 1024).toFixed(1)}KB` : `${log.size}B`}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={log.tlsUsed ? 'Yes' : 'No'}
                          size="small"
                          color={log.tlsUsed ? 'success' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 20, 50]}
          />
        </Paper>
      )}
    </Box>
  );
};

export default MailLogsPage;
