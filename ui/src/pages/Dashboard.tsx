import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import InboxIcon from "@mui/icons-material/Inbox";
import SendIcon from "@mui/icons-material/Send";
import DnsIcon from "@mui/icons-material/Dns";
import MailboxIcon from "@mui/icons-material/MarkunreadMailbox";
import DraftsIcon from "@mui/icons-material/Drafts";
import { Layout } from "../components/layout/Layout";
import { Breadcrumb } from "../components/common/Breadcrumb";
import { domainService } from "../services/domainService";
import { mailboxService } from "../services/mailboxService";
import { emailService } from "../services/emailService";

interface Stats {
  totalDomains: number;
  totalMailboxes: number;
  totalEmails: number;
  unreadEmails: number;
  sentEmails: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalDomains: 0,
    totalMailboxes: 0,
    totalEmails: 0,
    unreadEmails: 0,
    sentEmails: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [domainsRes, mailboxesRes, inboxRes, sentRes] = await Promise.all(
          [
            domainService.getAll({ limit: 1 }),
            mailboxService.getAll({ limit: 1 }),
            emailService.getAll({ folder: "inbox", limit: 1 }),
            emailService.getAll({ folder: "sent", limit: 1 }),
          ],
        );
        setStats({
          totalDomains: domainsRes.pagination.total,
          totalMailboxes: mailboxesRes.pagination.total,
          totalEmails: inboxRes.pagination.total,
          unreadEmails: inboxRes.pagination.total,
          sentEmails: sentRes.pagination.total,
        });
      } catch {
        console.error("Failed to fetch stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    {
      label: "Domains",
      value: stats.totalDomains,
      icon: <DnsIcon />,
      color: "#3b82f6",
    },
    {
      label: "Mailboxes",
      value: stats.totalMailboxes,
      icon: <MailboxIcon />,
      color: "#10b981",
    },
    {
      label: "Inbox",
      value: stats.totalEmails,
      icon: <InboxIcon />,
      color: "#22c55e",
    },
    {
      label: "Unread",
      value: stats.unreadEmails,
      icon: <DraftsIcon />,
      color: "#f59e0b",
    },
    {
      label: "Sent",
      value: stats.sentEmails,
      icon: <SendIcon />,
      color: "#8b5cf6",
    },
  ];

  return (
    <Layout>
      <Breadcrumb items={[{ label: "Dashboard" }]} />
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Welcome to Exyconn Mail Service
      </Typography>
      <Grid container spacing={3}>
        {statCards.map((card) => (
          <Grid key={card.label} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      {card.label}
                    </Typography>
                    <Typography variant="h4" sx={{ mt: 1 }}>
                      {loading ? "-" : card.value}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      backgroundColor: card.color,
                      borderRadius: "50%",
                      p: 1.5,
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {card.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Paper sx={{ mt: 3, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Quick Start Guide
        </Typography>
        <Typography variant="body2" color="text.secondary">
          1. Go to Domains to add your domain and configure DKIM, SPF, and DMARC
          records.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          2. Set up MX records in your DNS provider to point to your mail
          server.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          3. Create mailboxes for your domain to start sending and receiving
          emails.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          4. Use the Inbox and Compose pages to manage your emails.
        </Typography>
      </Paper>
    </Layout>
  );
}
