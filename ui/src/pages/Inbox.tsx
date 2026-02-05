import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import IconButton from "@mui/material/IconButton";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Layout } from "../components/layout/Layout";
import { Breadcrumb } from "../components/common/Breadcrumb";
import { emailService, Email } from "../services/emailService";

type Folder = "inbox" | "sent" | "trash";

export default function Inbox() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [folder, setFolder] = useState<Folder>("inbox");

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const res = await emailService.getAll({
        folder,
        page: page + 1,
        limit: rowsPerPage,
      });
      setEmails(res.data);
      setTotal(res.pagination.total);
    } catch {
      console.error("Failed to fetch emails");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, [page, rowsPerPage, folder]);

  const handleToggleStar = async (id: string, isStarred: boolean) => {
    await emailService.toggleStar(id);
    setEmails((prev) =>
      prev.map((e) => (e._id === id ? { ...e, isStarred: !isStarred } : e)),
    );
  };

  const handleDelete = async (id: string) => {
    await emailService.moveToTrash(id);
    fetchEmails();
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <Layout>
      <Breadcrumb items={[{ label: "Inbox" }]} />
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h4" component="h1">
          {folder.charAt(0).toUpperCase() + folder.slice(1)}
        </Typography>
        <IconButton onClick={fetchEmails} title="Refresh">
          <RefreshIcon />
        </IconButton>
      </Box>
      <Tabs
        value={folder}
        onChange={(_, v) => {
          setFolder(v);
          setPage(0);
        }}
        sx={{ mb: 2 }}
      >
        <Tab value="inbox" label="Inbox" />
        <Tab value="sent" label="Sent" />
        <Tab value="trash" label="Trash" />
      </Tabs>
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox disabled />
                </TableCell>
                <TableCell width={40} />
                <TableCell>From</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Date</TableCell>
                <TableCell width={80}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : emails.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No emails found
                  </TableCell>
                </TableRow>
              ) : (
                emails.map((email) => (
                  <TableRow
                    key={email._id}
                    sx={{ bgcolor: email.isRead ? "inherit" : "action.hover" }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleToggleStar(email._id, email.isStarred)
                        }
                      >
                        {email.isStarred ? (
                          <StarIcon color="warning" />
                        ) : (
                          <StarBorderIcon />
                        )}
                      </IconButton>
                    </TableCell>
                    <TableCell>{email.from}</TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        {email.subject}
                        {!email.isRead && (
                          <Chip label="New" size="small" color="primary" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{formatDate(email.createdAt)}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(email._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
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
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>
    </Layout>
  );
}
