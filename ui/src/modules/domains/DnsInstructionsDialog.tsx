import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

interface DnsRecord {
  type: string;
  name: string;
  value: string;
  verified: boolean;
}

interface DnsInstructionsDialogProps {
  open: boolean;
  onClose: () => void;
  domainName: string;
  records: DnsRecord[];
  onVerify: () => void;
  verifying: boolean;
}

const DnsInstructionsDialog: React.FC<DnsInstructionsDialogProps> = ({
  open,
  onClose,
  domainName,
  records,
  onVerify,
  verifying,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>DNS Setup for {domainName}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Add the following DNS records to your domain registrar:
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Value</TableCell>
                <TableCell align="center">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map((record, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Chip
                      label={record.type}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell
                    sx={{
                      wordBreak: "break-all",
                      fontFamily: "monospace",
                      fontSize: 12,
                    }}
                  >
                    {record.name}
                  </TableCell>
                  <TableCell
                    sx={{
                      wordBreak: "break-all",
                      fontFamily: "monospace",
                      fontSize: 12,
                    }}
                  >
                    {record.value}
                  </TableCell>
                  <TableCell align="center">
                    {record.verified ? (
                      <CheckCircleIcon color="success" fontSize="small" />
                    ) : (
                      <CancelIcon color="error" fontSize="small" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" onClick={onVerify} disabled={verifying}>
          {verifying ? "Verifying..." : "Verify DNS"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DnsInstructionsDialog;
