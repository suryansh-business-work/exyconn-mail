import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Domain, DomainInput } from "../../services/domainService";

interface DomainDialogProps {
  open: boolean;
  domain: Domain | null;
  onClose: () => void;
  onSubmit: (values: DomainInput) => Promise<void>;
}

const validationSchema = Yup.object({
  name: Yup.string()
    .required("Domain name is required")
    .matches(
      /^[a-z0-9][a-z0-9-]*\.[a-z]{2,}$/i,
      "Invalid domain format (e.g., example.com)",
    ),
  mxHost: Yup.string().required("MX host is required"),
  mxPriority: Yup.number().min(1).max(100),
  smtpPort: Yup.number().min(1).max(65535),
  imapPort: Yup.number().min(1).max(65535),
  pop3Port: Yup.number().min(1).max(65535),
});

export function DomainDialog({
  open,
  domain,
  onClose,
  onSubmit,
}: DomainDialogProps) {
  const formik = useFormik({
    initialValues: {
      name: domain?.name || "",
      mxHost: domain?.mxHost || "",
      mxPriority: domain?.mxPriority || 10,
      smtpPort: domain?.smtpPort || 25,
      imapPort: domain?.imapPort || 993,
      pop3Port: domain?.pop3Port || 995,
      spfRecord: domain?.spfRecord || "",
      dmarcRecord: domain?.dmarcRecord || "",
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, setStatus }) => {
      try {
        await onSubmit(values);
        formik.resetForm();
      } catch (err) {
        setStatus((err as Error).message);
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
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{domain ? "Edit Domain" : "Add Domain"}</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Domain Name"
                placeholder="example.com"
                {...formik.getFieldProps("name")}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                disabled={!!domain}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="MX Host"
                placeholder="mail.example.com"
                {...formik.getFieldProps("mxHost")}
                error={formik.touched.mxHost && Boolean(formik.errors.mxHost)}
                helperText={formik.touched.mxHost && formik.errors.mxHost}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                type="number"
                label="MX Priority"
                {...formik.getFieldProps("mxPriority")}
                error={
                  formik.touched.mxPriority && Boolean(formik.errors.mxPriority)
                }
                helperText={
                  formik.touched.mxPriority && formik.errors.mxPriority
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                type="number"
                label="SMTP Port"
                {...formik.getFieldProps("smtpPort")}
                error={
                  formik.touched.smtpPort && Boolean(formik.errors.smtpPort)
                }
                helperText={formik.touched.smtpPort && formik.errors.smtpPort}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                type="number"
                label="IMAP Port"
                {...formik.getFieldProps("imapPort")}
                error={
                  formik.touched.imapPort && Boolean(formik.errors.imapPort)
                }
                helperText={formik.touched.imapPort && formik.errors.imapPort}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="SPF Record (optional)"
                placeholder="v=spf1 mx a -all"
                {...formik.getFieldProps("spfRecord")}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="DMARC Record (optional)"
                placeholder="v=DMARC1; p=quarantine;"
                {...formik.getFieldProps("dmarcRecord")}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={formik.isSubmitting}
            startIcon={formik.isSubmitting && <CircularProgress size={16} />}
          >
            {domain ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
