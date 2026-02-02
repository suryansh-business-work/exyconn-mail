import { FC } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TablePagination from '@mui/material/TablePagination';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Mailbox } from '../../services/mailboxService';

interface MailboxTableProps {
  mailboxes: Mailbox[];
  loading: boolean;
  page: number;
  rowsPerPage: number;
  total: number;
  search: string;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onSearchChange: (search: string) => void;
  onEdit: (mailbox: Mailbox) => void;
  onDelete: (id: string) => void;
  formatQuota: (bytes: number) => string;
}

export const MailboxTable: FC<MailboxTableProps> = ({
  mailboxes,
  loading,
  page,
  rowsPerPage,
  total,
  search,
  onPageChange,
  onRowsPerPageChange,
  onSearchChange,
  onEdit,
  onDelete,
  formatQuota,
}) => {
  const getQuotaUsagePercent = (used: number, limit: number) => {
    return limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  };

  return (
    <Paper>
      <Box sx={{ p: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search mailboxes..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Email Address</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Quota Usage</TableCell>
            <TableCell>Auto Reply</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} align="center">
                <CircularProgress />
              </TableCell>
            </TableRow>
          ) : mailboxes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center">
                No mailboxes found
              </TableCell>
            </TableRow>
          ) : (
            mailboxes.map((mailbox) => {
              const usagePercent = getQuotaUsagePercent(mailbox.quotaUsed, mailbox.quotaLimit);
              return (
                <TableRow key={mailbox._id}>
                  <TableCell>{mailbox.email}</TableCell>
                  <TableCell>{mailbox.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={mailbox.isActive ? 'Active' : 'Inactive'}
                      color={mailbox.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ minWidth: 200 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ flex: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={usagePercent}
                          color={usagePercent > 90 ? 'error' : usagePercent > 70 ? 'warning' : 'primary'}
                        />
                      </Box>
                      <Typography variant="caption" sx={{ minWidth: 100 }}>
                        {formatQuota(mailbox.quotaUsed)} / {formatQuota(mailbox.quotaLimit)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={mailbox.autoReply ? 'Enabled' : 'Disabled'}
                      color={mailbox.autoReply ? 'info' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => onEdit(mailbox)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => onDelete(mailbox._id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={total}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_, p) => onPageChange(p)}
        onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </Paper>
  );
};
