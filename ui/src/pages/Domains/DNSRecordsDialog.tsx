import { useState, useEffect } from "react";
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
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { domainService, DNSRecord } from "../../services/domainService";

interface DNSRecordsDialogProps {
  open: boolean;
  domainId: string | null;
  onClose: () => void;
}

export function DNSRecordsDialog({
  open,
  domainId,
  onClose,
}: DNSRecordsDialogProps) {
  const [records, setRecords] = useState<DNSRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (open && domainId) {
      setLoading(true);
      setError("");
      domainService
        .getDNSRecords(domainId)
        .then((res) => setRecords(res.records))
        .catch(() => setError("Failed to fetch DNS records"))
        .finally(() => setLoading(false));
    }
  }, [open, domainId]);

  const handleCopy = async (value: string, id: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>DNS Records Configuration</DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          Add these DNS records to your domain registrar to configure email for
          your domain.
        </Alert>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Host</TableCell>
                <TableCell>Value</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell width={60} />
              </TableRow>
            </TableHead>
            <TableBody>
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 5 }).map((__, j) => (
                        <TableCell key={j}>
                          <Skeleton />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : records.map((record, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {record.type}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ wordBreak: "break-all" }}
                        >
                          {record.host}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            wordBreak: "break-all",
                            maxWidth: 400,
                            fontSize: "0.75rem",
                            fontFamily: "monospace",
                          }}
                        >
                          {record.value.length > 100
                            ? `${record.value.substring(0, 100)}...`
                            : record.value}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          {record.description}
                        </Typography>
                      </TableCell>
                      <TableCell>{record.priority || "-"}</TableCell>
                      <TableCell>
                        <Tooltip
                          title={copied === `${idx}` ? "Copied!" : "Copy value"}
                        >
                          <IconButton
                            size="small"
                            onClick={() => handleCopy(record.value, `${idx}`)}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
