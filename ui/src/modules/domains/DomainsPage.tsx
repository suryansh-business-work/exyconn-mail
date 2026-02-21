import React, { useEffect, useState, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import TablePagination from "@mui/material/TablePagination";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Paper from "@mui/material/Paper";
import AddIcon from "@mui/icons-material/Add";
import DnsIcon from "@mui/icons-material/Dns";
import DeleteIcon from "@mui/icons-material/Delete";
import AppBreadcrumb from "../../components/AppBreadcrumb";
import AddDomainDialog from "./AddDomainDialog";
import DnsInstructionsDialog from "./DnsInstructionsDialog";
import { domainApi, Domain } from "../../api/domainApi";
import { useToast } from "../../hooks/useToast";

const statusColors: Record<string, "success" | "warning" | "error" | "info"> = {
  active: "success",
  pending: "warning",
  suspended: "error",
  "dns-pending": "info",
};

const DomainsPage: React.FC = () => {
  const { showToast } = useToast();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [addOpen, setAddOpen] = useState(false);
  const [dnsOpen, setDnsOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [dnsRecords, setDnsRecords] = useState<Domain["dnsRecords"]>([]);
  const [verifying, setVerifying] = useState(false);

  const fetchDomains = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await domainApi.getAll({
        page: page + 1,
        limit: rowsPerPage,
        search: search || undefined,
        sortBy,
        sortOrder,
      });
      setDomains(data.data.domains || []);
      setTotal(data.data.total);
    } catch {
      showToast("Failed to load domains", "error");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, sortBy, sortOrder, showToast]);

  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  const handleAddDomain = async (name: string) => {
    try {
      await domainApi.create(name);
      showToast("Domain added successfully");
      fetchDomains();
    } catch {
      showToast("Failed to add domain", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this domain?")) return;
    try {
      await domainApi.delete(id);
      showToast("Domain deleted");
      fetchDomains();
    } catch {
      showToast("Failed to delete domain", "error");
    }
  };

  const handleShowDns = async (domain: Domain) => {
    setSelectedDomain(domain);
    try {
      const { data } = await domainApi.getDnsInstructions(domain._id);
      setDnsRecords(data.data.records);
      setDnsOpen(true);
    } catch {
      showToast("Failed to load DNS instructions", "error");
    }
  };

  const handleVerifyDns = async () => {
    if (!selectedDomain) return;
    setVerifying(true);
    try {
      const { data } = await domainApi.verifyDns(selectedDomain._id);
      showToast(
        data.data.mxVerified
          ? "DNS verification successful!"
          : "Some records not yet verified",
        data.data.mxVerified ? "success" : "warning",
      );
      setDnsRecords(data.data.domain.dnsRecords);
      fetchDomains();
    } catch {
      showToast("DNS verification failed", "error");
    } finally {
      setVerifying(false);
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  return (
    <Box>
      <AppBreadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Domains" },
        ]}
      />
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={2}
        mb={3}
      >
        <Typography variant="h4">Domains</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddOpen(true)}
        >
          Add Domain
        </Button>
      </Box>

      <Box mb={2}>
        <TextField
          size="small"
          placeholder="Search domains..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          sx={{ minWidth: { xs: "100%", sm: 300 } }}
        />
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === "name"}
                      direction={sortBy === "name" ? sortOrder : "asc"}
                      onClick={() => handleSort("name")}
                    >
                      Domain
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>MX</TableCell>
                  <TableCell>SPF</TableCell>
                  <TableCell>DKIM</TableCell>
                  <TableCell>Mailboxes</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === "createdAt"}
                      direction={sortBy === "createdAt" ? sortOrder : "asc"}
                      onClick={() => handleSort("createdAt")}
                    >
                      Created
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {domains.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography color="text.secondary" py={4}>
                        No domains found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  domains.map((domain) => (
                    <TableRow key={domain._id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {domain.name}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={domain.status}
                          size="small"
                          color={statusColors[domain.status] || "default"}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={domain.mxVerified ? "Yes" : "No"}
                          size="small"
                          color={domain.mxVerified ? "success" : "default"}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={domain.spfVerified ? "Yes" : "No"}
                          size="small"
                          color={domain.spfVerified ? "success" : "default"}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={domain.dkimVerified ? "Yes" : "No"}
                          size="small"
                          color={domain.dkimVerified ? "success" : "default"}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{domain.mailboxCount}</TableCell>
                      <TableCell>
                        {new Date(domain.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="DNS Instructions">
                          <IconButton
                            size="small"
                            onClick={() => handleShowDns(domain)}
                          >
                            <DnsIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(domain._id)}
                          >
                            <DeleteIcon fontSize="small" />
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
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Paper>
      )}

      <AddDomainDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={handleAddDomain}
      />
      {selectedDomain && (
        <DnsInstructionsDialog
          open={dnsOpen}
          onClose={() => setDnsOpen(false)}
          domainName={selectedDomain.name}
          records={dnsRecords}
          onVerify={handleVerifyDns}
          verifying={verifying}
        />
      )}
    </Box>
  );
};

export default DomainsPage;
