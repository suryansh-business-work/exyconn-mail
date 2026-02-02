import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import { domainsRouter } from './features/domains/domains.routes';
import { mailboxesRouter } from './features/mailboxes/mailboxes.routes';
import { emailsRouter } from './features/emails/emails.routes';
import { startSMTPServer } from './services/smtp.service';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4032;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '2525', 10);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/domains', domainsRouter);
app.use('/api/mailboxes', mailboxesRouter);
app.use('/api/emails', emailsRouter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'exyconn-mail-server' });
});

// Start server
const startServer = async () => {
  await connectDatabase();

  // Start HTTP API server
  app.listen(PORT, () => {
    console.log(`🚀 Exyconn Mail API running on port ${PORT}`);
  });

  // Start SMTP server
  try {
    await startSMTPServer({
      port: SMTP_PORT,
      authOptional: true,
    });
  } catch (error) {
    console.error('Failed to start SMTP server:', error);
  }
};

startServer();

export default app;
