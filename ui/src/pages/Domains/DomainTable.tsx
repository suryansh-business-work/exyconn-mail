import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DnsIcon from "@mui/icons-material/Dns";
import VerifiedIcon from "@mui/icons-material/Verified";
import KeyIcon from "@mui/icons-material/Key";
import { Domain } from "../../services/domainService";

interface DomainTableProps {
  domains: Domain[];
  loading: boolean;
  page: number;
  rowsPerPage: number;
  total: number;
  search: string;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onSearchChange: (search: string) => void;
  onEdit: (domain: Domain) => void;
  onDelete: (id: string) => void;
  onViewDNS: (id: string) => void;
  onVerify: (id: string) => void;
  onGenerateDKIM: (id: string) => void;
}

export function DomainTable({
  domains,
  loading,
  page,
  rowsPerPage,
  total,
  search,
  onPageChange,
  onRowsPerPageChange,
  onSearchChange,
  onEdit,
  onDelete,
  onViewDNS,
  onVerify,
  onGenerateDKIM,
}: DomainTableProps) {
  return (
    <Paper>
      <Box sx={{ p: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search domains..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Domain</TableCell>
              <TableCell>MX Host</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>DKIM</TableCell>
              <TableCell width={200}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : domains.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No domains found
                </TableCell>
              </TableRow>
            ) : (
              domains.map((domain) => (
                <TableRow key={domain._id}>
                  <TableCell>{domain.name}</TableCell>
                  <TableCell>{domain.mxHost}</TableCell>
                  <TableCell>
                    <Chip
                      label={domain.isVerified ? "Verified" : "Unverified"}
                      color={domain.isVerified ? "success" : "warning"}
                      size="small"
                    />
                    <Chip
                      label={domain.isActive ? "Active" : "Inactive"}
                      color={domain.isActive ? "primary" : "default"}
                      size="small"
                      sx={{ ml: 0.5 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={domain.dkim ? "Configured" : "Not Set"}
                      color={domain.dkim ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View DNS Records">
                      <IconButton
                        size="small"
                        onClick={() => onViewDNS(domain._id)}
                      >
                        <DnsIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Verify Domain">
                      <IconButton
                        size="small"
                        onClick={() => onVerify(domain._id)}
                      >
                        <VerifiedIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Generate DKIM">
                      <IconButton
                        size="small"
                        onClick={() => onGenerateDKIM(domain._id)}
                      >
                        <KeyIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => onEdit(domain)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onDelete(domain._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
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
        onPageChange={(_, p) => onPageChange(p)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) =>
          onRowsPerPageChange(parseInt(e.target.value, 10))
        }
      />
    </Paper>
  );
}
