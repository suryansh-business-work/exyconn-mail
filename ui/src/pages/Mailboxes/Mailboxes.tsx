import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import AddIcon from '@mui/icons-material/Add';
import { Layout } from '../../components/layout/Layout';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { mailboxService, Mailbox, MailboxInput, MailboxUpdateInput } from '../../services/mailboxService';
import { MailboxTable } from './MailboxTable';
import { MailboxDialog } from './MailboxDialog';

export default function Mailboxes() {
  const [mailboxes, setMailboxes] = useState<Mailbox[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMailbox, setEditingMailbox] = useState<Mailbox | null>(null);

  const fetchMailboxes = async () => {
    setLoading(true);
    try {
      const res = await mailboxService.getAll({
        page: page + 1,
        limit: rowsPerPage,
        search: search || undefined,
      });
      setMailboxes(res.data);
      setTotal(res.pagination.total);
      setError('');
    } catch {
      setError('Failed to fetch mailboxes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMailboxes();
  }, [page, rowsPerPage, search]);

  const handleCreate = () => {
    setEditingMailbox(null);
    setDialogOpen(true);
  };

  const handleEdit = (mailbox: Mailbox) => {
    setEditingMailbox(mailbox);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this mailbox?')) return;
    try {
      await mailboxService.delete(id);
      fetchMailboxes();
    } catch {
      setError('Failed to delete mailbox');
    }
  };

  const handleSubmit = async (values: MailboxInput | MailboxUpdateInput) => {
    try {
      if (editingMailbox) {
        await mailboxService.update(editingMailbox._id, values as MailboxUpdateInput);
      } else {
        await mailboxService.create(values as MailboxInput);
      }
      setDialogOpen(false);
      fetchMailboxes();
    } catch {
      throw new Error('Failed to save mailbox');
    }
  };

  const formatQuota = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(2)} GB`;
  };

  return (
    <Layout>
      <Breadcrumb items={[{ label: 'Mailboxes' }]} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Mailboxes
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
          Add Mailbox
        </Button>
      </Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      <MailboxTable
        mailboxes={mailboxes}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        total={total}
        search={search}
        onPageChange={setPage}
        onRowsPerPageChange={(rpp) => {
          setRowsPerPage(rpp);
          setPage(0);
        }}
        onSearchChange={setSearch}
        onEdit={handleEdit}
        onDelete={handleDelete}
        formatQuota={formatQuota}
      />
      <MailboxDialog
        open={dialogOpen}
        mailbox={editingMailbox}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      />
    </Layout>
  );
}
