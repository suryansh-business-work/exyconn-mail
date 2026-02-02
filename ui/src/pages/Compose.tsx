import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import SendIcon from '@mui/icons-material/Send';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Layout } from '../components/layout/Layout';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { emailService } from '../services/emailService';
import { mailboxService, Mailbox } from '../services/mailboxService';

const validationSchema = Yup.object({
  mailboxId: Yup.string().required('Mailbox is required'),
  to: Yup.string().email('Invalid email address').required('Recipient is required'),
  subject: Yup.string().required('Subject is required'),
  body: Yup.string().required('Message is required'),
});

export default function Compose() {
  const navigate = useNavigate();
  const [mailboxes, setMailboxes] = useState<Mailbox[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMailboxes = async () => {
      try {
        const res = await mailboxService.getAll({ limit: 100, isActive: true });
        setMailboxes(res.data);
      } catch {
        setError('Failed to load mailboxes');
      } finally {
        setLoading(false);
      }
    };
    fetchMailboxes();
  }, []);

  const formik = useFormik({
    initialValues: { mailboxId: '', to: '', subject: '', body: '' },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const selectedMailbox = mailboxes.find((m) => m._id === values.mailboxId);
        if (!selectedMailbox) {
          setError('Please select a mailbox');
          return;
        }
        await emailService.send({
          mailboxId: values.mailboxId,
          from: selectedMailbox.email,
          to: [values.to],
          subject: values.subject,
          textBody: values.body,
        });
        navigate('/inbox');
      } catch {
        setError('Failed to send email');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Layout>
      <Breadcrumb items={[{ label: 'Compose' }]} />
      <Typography variant="h4" component="h1" gutterBottom>
        Compose Email
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={formik.handleSubmit}>
          <TextField
            select
            fullWidth
            label="From (Mailbox)"
            {...formik.getFieldProps('mailboxId')}
            error={formik.touched.mailboxId && Boolean(formik.errors.mailboxId)}
            helperText={formik.touched.mailboxId && formik.errors.mailboxId}
            disabled={loading}
            sx={{ mb: 2 }}
          >
            {loading ? (
              <MenuItem disabled><CircularProgress size={20} /></MenuItem>
            ) : mailboxes.length === 0 ? (
              <MenuItem disabled>No mailboxes configured</MenuItem>
            ) : (
              mailboxes.map((m) => (
                <MenuItem key={m._id} value={m._id}>
                  {m.name ? `${m.name} <${m.email}>` : m.email}
                </MenuItem>
              ))
            )}
          </TextField>
          <TextField
            fullWidth
            label="To"
            type="email"
            {...formik.getFieldProps('to')}
            error={formik.touched.to && Boolean(formik.errors.to)}
            helperText={formik.touched.to && formik.errors.to}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Subject"
            {...formik.getFieldProps('subject')}
            error={formik.touched.subject && Boolean(formik.errors.subject)}
            helperText={formik.touched.subject && formik.errors.subject}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={10}
            label="Message"
            {...formik.getFieldProps('body')}
            error={formik.touched.body && Boolean(formik.errors.body)}
            helperText={formik.touched.body && formik.errors.body}
            sx={{ mb: 2 }}
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            startIcon={formik.isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? 'Sending...' : 'Send Email'}
          </Button>
        </Box>
      </Paper>
    </Layout>
  );
}
