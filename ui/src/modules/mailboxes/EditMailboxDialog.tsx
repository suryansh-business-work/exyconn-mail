import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Mailbox } from '../../api/mailboxApi';

const validationSchema = Yup.object({
  name: Yup.string().min(2).optional(),
  quota: Yup.number().min(1).optional(),
  status: Yup.string().oneOf(['active', 'suspended', 'disabled']).optional(),
  forwardTo: Yup.string().email('Invalid email').nullable().optional(),
});

interface EditMailboxDialogProps {
  open: boolean;
  onClose: () => void;
  mailbox: Mailbox | null;
  onSubmit: (id: string, values: Record<string, unknown>) => Promise<void>;
}

const EditMailboxDialog: React.FC<EditMailboxDialogProps> = ({
  open,
  onClose,
  mailbox,
  onSubmit,
}) => {
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: mailbox?.name || '',
      quota: mailbox?.quota || 1024,
      status: mailbox?.status || 'active',
      forwardTo: mailbox?.forwardTo || '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      if (!mailbox) return;
      try {
        await onSubmit(mailbox._id, values);
        onClose();
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>Edit Mailbox: {mailbox?.email}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Display Name"
            name="name"
            margin="normal"
            value={formik.values.name}
            onChange={formik.handleChange}
          />
          <TextField
            fullWidth
            label="Quota (MB)"
            name="quota"
            type="number"
            margin="normal"
            value={formik.values.quota}
            onChange={formik.handleChange}
            error={formik.touched.quota && !!formik.errors.quota}
            helperText={formik.touched.quota && formik.errors.quota}
          />
          <TextField
            fullWidth
            select
            label="Status"
            name="status"
            margin="normal"
            value={formik.values.status}
            onChange={formik.handleChange}
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="suspended">Suspended</MenuItem>
            <MenuItem value="disabled">Disabled</MenuItem>
          </TextField>
          <TextField
            fullWidth
            label="Forward To (optional)"
            name="forwardTo"
            margin="normal"
            value={formik.values.forwardTo}
            onChange={formik.handleChange}
            error={formik.touched.forwardTo && !!formik.errors.forwardTo}
            helperText={formik.touched.forwardTo && formik.errors.forwardTo}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
            {formik.isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditMailboxDialog;
