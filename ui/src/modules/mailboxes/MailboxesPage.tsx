import React, { useEffect, useState, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import TablePagination from "@mui/material/TablePagination";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Paper from "@mui/material/Paper";
import LinearProgress from "@mui/material/LinearProgress";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import AppBreadcrumb from "../../components/AppBreadcrumb";
import CreateMailboxDialog from "./CreateMailboxDialog";
import EditMailboxDialog from "./EditMailboxDialog";
import {
  mailboxApi,
  Mailbox,
  CreateMailboxPayload,
} from "../../api/mailboxApi";
import { useToast } from "../../hooks/useToast";

const statusColors: Record<string, "success" | "warning" | "error"> = {
  active: "success",
  suspended: "warning",
  disabled: "error",
};

const MailboxesPage: React.FC = () => {
  const { showToast } = useToast();
  const [mailboxes, setMailboxes] = useState<Mailbox[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedMailbox, setSelectedMailbox] = useState<Mailbox | null>(null);

  const fetchMailboxes = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await mailboxApi.getAll({
        page: page + 1,
        limit: rowsPerPage,
        search: search || undefined,
        sortBy,
        sortOrder,
      });
      setMailboxes(data.data.mailboxes || []);
      setTotal(data.data.total);
    } catch {
      showToast("Failed to load mailboxes", "error");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, sortBy, sortOrder, showToast]);

  useEffect(() => {
    fetchMailboxes();
  }, [fetchMailboxes]);

  const handleCreate = async (values: CreateMailboxPayload) => {
    try {
      await mailboxApi.create(values);
      showToast("Mailbox created successfully");
      fetchMailboxes();
    } catch {
      showToast("Failed to create mailbox", "error");
    }
  };

  const handleEdit = async (id: string, values: Record<string, unknown>) => {
    try {
      await mailboxApi.update(id, values);
      showToast("Mailbox updated");
      fetchMailboxes();
    } catch {
      showToast("Failed to update mailbox", "error");
    }
  };

  const handleSuspend = async (id: string) => {
    try {
      await mailboxApi.suspend(id);
      showToast("Mailbox suspended");
      fetchMailboxes();
    } catch {
      showToast("Failed to suspend mailbox", "error");
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await mailboxApi.activate(id);
      showToast("Mailbox activated");
      fetchMailboxes();
    } catch {
      showToast("Failed to activate mailbox", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this mailbox?"))
      return;
    try {
      await mailboxApi.delete(id);
      showToast("Mailbox deleted");
      fetchMailboxes();
    } catch {
      showToast("Failed to delete mailbox", "error");
    }
  };

  const handleSort = (field: string) => {
    setSortBy(field);
    setSortOrder(sortBy === field && sortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <Box>
      <AppBreadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Mailboxes" },
        ]}
      />
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={2}
        mb={3}
      >
        <Typography variant="h4">Mailboxes</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateOpen(true)}
        >
          Create Mailbox
        </Button>
      </Box>

      <Box mb={2}>
        <TextField
          size="small"
          placeholder="Search mailboxes..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          sx={{ minWidth: { xs: "100%", sm: 300 } }}
        />
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === "email"}
                      direction={sortBy === "email" ? sortOrder : "asc"}
                      onClick={() => handleSort("email")}
                    >
                      Email
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Domain</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Quota</TableCell>
                  <TableCell>Messages</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === "createdAt"}
                      direction={sortBy === "createdAt" ? sortOrder : "asc"}
                      onClick={() => handleSort("createdAt")}
                    >
                      Created
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mailboxes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography color="text.secondary" py={4}>
                        No mailboxes found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  mailboxes.map((mb) => {
                    const quotaPercent =
                      mb.quota > 0
                        ? Math.min((mb.usedQuota / mb.quota) * 100, 100)
                        : 0;
                    return (
                      <TableRow key={mb._id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {mb.email}
                        </TableCell>
                        <TableCell>{mb.name}</TableCell>
                        <TableCell>{mb.domainName}</TableCell>
                        <TableCell>
                          <Chip
                            label={mb.status}
                            size="small"
                            color={statusColors[mb.status] || "default"}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ minWidth: 80 }}>
                            <Typography variant="caption">
                              {mb.usedQuota}MB / {mb.quota}MB
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={quotaPercent}
                              color={quotaPercent > 90 ? "error" : "primary"}
                              sx={{ mt: 0.5 }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell>{mb.messageCount}</TableCell>
                        <TableCell>
                          {new Date(mb.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedMailbox(mb);
                                setEditOpen(true);
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {mb.status === "active" ? (
                            <Tooltip title="Suspend">
                              <IconButton
                                size="small"
                                color="warning"
                                onClick={() => handleSuspend(mb._id)}
                              >
                                <BlockIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Tooltip title="Activate">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleActivate(mb._id)}
                              >
                                <CheckCircleIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(mb._id)}
                            >
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
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Paper>
      )}

      <CreateMailboxDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
      />
      <EditMailboxDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        mailbox={selectedMailbox}
        onSubmit={handleEdit}
      />
    </Box>
  );
};

export default MailboxesPage;
