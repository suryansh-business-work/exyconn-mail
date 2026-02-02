import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import AddIcon from "@mui/icons-material/Add";
import { Layout } from "../../components/layout/Layout";
import { Breadcrumb } from "../../components/common/Breadcrumb";
import {
  domainService,
  Domain,
  DomainInput,
} from "../../services/domainService";
import { DomainTable } from "./DomainTable";
import { DomainDialog } from "./DomainDialog";
import { DNSRecordsDialog } from "./DNSRecordsDialog";

export default function Domains() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
  const [dnsDialogOpen, setDnsDialogOpen] = useState(false);
  const [selectedDomainId, setSelectedDomainId] = useState<string | null>(null);

  const fetchDomains = async () => {
    setLoading(true);
    try {
      const res = await domainService.getAll({
        page: page + 1,
        limit: rowsPerPage,
        search: search || undefined,
      });
      setDomains(res.data);
      setTotal(res.pagination.total);
      setError("");
    } catch {
      setError("Failed to fetch domains");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDomains();
  }, [page, rowsPerPage, search]);

  const handleCreate = () => {
    setEditingDomain(null);
    setDialogOpen(true);
  };

  const handleEdit = (domain: Domain) => {
    setEditingDomain(domain);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this domain?")) return;
    try {
      await domainService.delete(id);
      fetchDomains();
    } catch {
      setError("Failed to delete domain");
    }
  };

  const handleSubmit = async (values: DomainInput) => {
    try {
      if (editingDomain) {
        await domainService.update(editingDomain._id, values);
      } else {
        await domainService.create(values);
      }
      setDialogOpen(false);
      fetchDomains();
    } catch {
      throw new Error("Failed to save domain");
    }
  };

  const handleViewDNS = (id: string) => {
    setSelectedDomainId(id);
    setDnsDialogOpen(true);
  };

  const handleVerify = async (id: string) => {
    try {
      const res = await domainService.verify(id);
      if (res.verified) {
        alert("Domain verified successfully!");
      } else {
        alert(`Verification failed:\n${res.errors.join("\n")}`);
      }
      fetchDomains();
    } catch {
      setError("Failed to verify domain");
    }
  };

  const handleGenerateDKIM = async (id: string) => {
    try {
      await domainService.generateDKIM(id);
      alert("DKIM keys generated successfully!");
      fetchDomains();
    } catch {
      setError("Failed to generate DKIM");
    }
  };

  return (
    <Layout>
      <Breadcrumb items={[{ label: "Domains" }]} />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          Domains
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          Add Domain
        </Button>
      </Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      <DomainTable
        domains={domains}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        total={total}
        search={search}
        onPageChange={setPage}
        onRowsPerPageChange={(rpp) => {
          setRowsPerPage(rpp);
          setPage(0);
        }}
        onSearchChange={setSearch}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onViewDNS={handleViewDNS}
        onVerify={handleVerify}
        onGenerateDKIM={handleGenerateDKIM}
      />
      <DomainDialog
        open={dialogOpen}
        domain={editingDomain}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      />
      <DNSRecordsDialog
        open={dnsDialogOpen}
        domainId={selectedDomainId}
        onClose={() => setDnsDialogOpen(false)}
      />
    </Layout>
  );
}
