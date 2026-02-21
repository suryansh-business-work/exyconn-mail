import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import AppBreadcrumb from "../../components/AppBreadcrumb";
import StatCard from "./StatCard";
import { mailApi, DashboardStats } from "../../api/mailApi";
import { useToast } from "../../hooks/useToast";

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await mailApi.getDashboardStats();
        setStats(data.data.stats);
      } catch {
        showToast("Failed to load dashboard stats", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [showToast]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <AppBreadcrumb items={[{ label: "Dashboard" }]} />
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        Overview of your mail server
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Domains"
            value={stats?.domains.total ?? 0}
            subtitle={`${stats?.domains.active ?? 0} active`}
            color="primary.main"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Mailboxes"
            value={stats?.mailboxes.total ?? 0}
            subtitle={`${stats?.mailboxes.active ?? 0} active`}
            color="secondary.main"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Emails Today"
            value={stats?.mail.todayTotal ?? 0}
            subtitle={`${stats?.mail.weekTotal ?? 0} this week`}
            color="success.main"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Emails"
            value={stats?.mail.totalEmails ?? 0}
            subtitle={`${stats?.mail.bounced ?? 0} bounced`}
            color="warning.main"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Inbound"
            value={stats?.mail.inbound ?? 0}
            color="info.main"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Outbound"
            value={stats?.mail.outbound ?? 0}
            color="info.main"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Delivered"
            value={stats?.mail.delivered ?? 0}
            color="success.main"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Rejected"
            value={stats?.mail.rejected ?? 0}
            color="error.main"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
