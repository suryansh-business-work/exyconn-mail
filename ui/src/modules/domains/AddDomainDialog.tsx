import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { useFormik } from "formik";
import * as Yup from "yup";

const validationSchema = Yup.object({
  name: Yup.string()
    .matches(
      /^(?!-)([a-zA-Z0-9-]{1,63}(?<!-)\.)+[a-zA-Z]{2,}$/,
      "Invalid domain format (e.g. example.com)",
    )
    .required("Domain name is required"),
});

interface AddDomainDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
}

const AddDomainDialog: React.FC<AddDomainDialogProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const formik = useFormik({
    initialValues: { name: "" },
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        await onSubmit(values.name);
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

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>Add Domain</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Domain Name"
            name="name"
            placeholder="example.com"
            margin="normal"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.name && !!formik.errors.name}
            helperText={formik.touched.name && formik.errors.name}
            autoFocus
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? "Adding..." : "Add Domain"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddDomainDialog;
