import React, { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { domainApi, Domain } from '../../api/domainApi';

const validationSchema = Yup.object({
  localPart: Yup.string()
    .matches(/^[a-zA-Z0-9._%+-]+$/, 'Invalid username format')
    .required('Username is required'),
  domainId: Yup.string().required('Domain is required'),
  password: Yup.string().min(8, 'Min 8 characters').required('Password is required'),
  name: Yup.string().min(2, 'Min 2 characters').required('Display name is required'),
  quota: Yup.number().min(1, 'Min 1 MB').optional(),
});

interface CreateMailboxDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: {
    localPart: string;
    domainId: string;
    password: string;
    name: string;
    quota?: number;
  }) => Promise<void>;
}

const CreateMailboxDialog: React.FC<CreateMailboxDialogProps> = ({ open, onClose, onSubmit }) => {
  const [domains, setDomains] = useState<Domain[]>([]);

  useEffect(() => {
    if (open) {
      domainApi.getAll({ limit: 100, status: 'active' }).then(({ data }) => {
        setDomains(data.data.domains || []);
      });
    }
  }, [open]);

  const formik = useFormik({
    initialValues: {
      localPart: '',
      domainId: '',
      password: '',
      name: '',
      quota: 1024,
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        await onSubmit(values);
        resetForm();
        onClose();
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };
  const selectedDomain = domains.find((d) => d._id === formik.values.domainId);
  const preview =
    formik.values.localPart && selectedDomain
      ? `${formik.values.localPart}@${selectedDomain.name}`
      : '';

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>Create Mailbox</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            select
            label="Domain"
            name="domainId"
            margin="normal"
            value={formik.values.domainId}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.domainId && !!formik.errors.domainId}
            helperText={formik.touched.domainId && formik.errors.domainId}
          >
            {domains.map((d) => (
              <MenuItem key={d._id} value={d._id}>
                {d.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Username (local part)"
            name="localPart"
            margin="normal"
            value={formik.values.localPart}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.localPart && !!formik.errors.localPart}
            helperText={
              (formik.touched.localPart && formik.errors.localPart) ||
              (preview ? `Email: ${preview}` : '')
            }
          />
          <TextField
            fullWidth
            label="Display Name"
            name="name"
            margin="normal"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.name && !!formik.errors.name}
            helperText={formik.touched.name && formik.errors.name}
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            margin="normal"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && !!formik.errors.password}
            helperText={formik.touched.password && formik.errors.password}
          />
          <TextField
            fullWidth
            label="Quota (MB)"
            name="quota"
            type="number"
            margin="normal"
            value={formik.values.quota}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.quota && !!formik.errors.quota}
            helperText={formik.touched.quota && formik.errors.quota}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
            {formik.isSubmitting ? 'Creating...' : 'Create Mailbox'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateMailboxDialog;
