import { FC, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import {
  Mailbox,
  MailboxInput,
  MailboxUpdateInput,
} from "../../services/mailboxService";

interface MailboxDialogProps {
  open: boolean;
  mailbox: Mailbox | null;
  onClose: () => void;
  onSubmit: (values: MailboxInput | MailboxUpdateInput) => Promise<void>;
}

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().min(8, "Password must be at least 8 characters"),
  name: Yup.string(),
  quotaLimit: Yup.number()
    .min(0, "Must be positive")
    .required("Quota limit is required"),
  forwardTo: Yup.string().email("Invalid email"),
  autoReplyMessage: Yup.string(),
});

export const MailboxDialog: FC<MailboxDialogProps> = ({
  open,
  mailbox,
  onClose,
  onSubmit,
}) => {
  const [error, setError] = useState("");
  const isEdit = !!mailbox;

  const initialValues = {
    email: mailbox?.email || "",
    password: "",
    name: mailbox?.name || "",
    quotaLimit: mailbox ? mailbox.quotaLimit / (1024 * 1024 * 1024) : 1,
    forwardTo: mailbox?.forwardTo || "",
    autoReply: mailbox?.autoReply || false,
    autoReplyMessage: mailbox?.autoReplyMessage || "",
    isActive: mailbox?.isActive ?? true,
  };

  const handleSubmit = async (values: typeof initialValues) => {
    try {
      setError("");
      const data: MailboxInput | MailboxUpdateInput = {
        email: values.email,
        name: values.name || undefined,
        quotaLimit: values.quotaLimit * 1024 * 1024 * 1024,
        forwardTo: values.forwardTo || undefined,
        autoReply: values.autoReply,
        autoReplyMessage: values.autoReply
          ? values.autoReplyMessage
          : undefined,
        isActive: values.isActive,
      };
      if (!isEdit && values.password) {
        (data as MailboxInput).password = values.password;
      }
      if (isEdit && values.password) {
        (data as MailboxUpdateInput).password = values.password;
      }
      await onSubmit(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save mailbox");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? "Edit Mailbox" : "Create Mailbox"}</DialogTitle>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema.shape({
          password: isEdit
            ? Yup.string().min(8, "Password must be at least 8 characters")
            : Yup.string()
                .min(8, "Password must be at least 8 characters")
                .required("Password is required"),
        })}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          isSubmitting,
          setFieldValue,
        }) => (
          <Form>
            <DialogContent>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    name="email"
                    label="Email Address"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.email && !!errors.email}
                    helperText={touched.email && errors.email}
                    disabled={isEdit}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    name="password"
                    label={
                      isEdit
                        ? "New Password (leave blank to keep current)"
                        : "Password"
                    }
                    type="password"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.password && !!errors.password}
                    helperText={touched.password && errors.password}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    name="name"
                    label="Display Name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    name="quotaLimit"
                    label="Quota Limit"
                    type="number"
                    value={values.quotaLimit}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.quotaLimit && !!errors.quotaLimit}
                    helperText={touched.quotaLimit && errors.quotaLimit}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">GB</InputAdornment>
                        ),
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    name="forwardTo"
                    label="Forward To"
                    value={values.forwardTo}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.forwardTo && !!errors.forwardTo}
                    helperText={touched.forwardTo && errors.forwardTo}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={values.autoReply}
                        onChange={(e) =>
                          setFieldValue("autoReply", e.target.checked)
                        }
                      />
                    }
                    label="Enable Auto Reply"
                  />
                </Grid>
                {values.autoReply && (
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      name="autoReplyMessage"
                      label="Auto Reply Message"
                      multiline
                      rows={3}
                      value={values.autoReplyMessage}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </Grid>
                )}
                <Grid size={{ xs: 12 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={values.isActive}
                        onChange={(e) =>
                          setFieldValue("isActive", e.target.checked)
                        }
                      />
                    }
                    label="Active"
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={onClose}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : isEdit ? "Update" : "Create"}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};
