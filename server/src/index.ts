import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import config from './config/index';
import { connectDatabase } from './config/database';
import { swaggerSpec } from './config/swagger';
import {
  errorHandler,
  notFoundHandler,
  apiLimiter,
  authLimiter,
  webhookLimiter,
} from './middlewares/index';
import { authenticate, authorize } from './middlewares/auth.middleware';

// Module routes
import authRoutes from './modules/auth/auth.routes';
import domainRoutes from './modules/domain/domain.routes';
import mailboxRoutes from './modules/mailbox/mailbox.routes';
import mailRoutes from './modules/mail/mail.routes';
import { getDashboardStats } from './services/dashboard.service';

const app = express();

// Security & parsing middleware
app.use(helmet());
app.use(cors({ origin: config.corsOrigins, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Rate limiting
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/mail/events', webhookLimiter);

// Swagger docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/docs.json', (_req, res) => {
  res.json(swaggerSpec);
});

// Module routes
app.use('/api/auth', authRoutes);
app.use('/api/domains', domainRoutes);
app.use('/api/mailboxes', mailboxRoutes);
app.use('/api/mail', mailRoutes);

// Dashboard stats
app.get(
  '/api/dashboard/stats',
  authenticate,
  authorize('admin', 'domain-owner'),
  getDashboardStats,
);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'exyconn-mail-server',
    timestamp: new Date().toISOString(),
  });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await connectDatabase();

    app.listen(config.port, () => {
      console.log(`🚀 Exyconn Mail Server running on port ${config.port}`);
      console.log(`📚 API Docs: http://localhost:${config.port}/api/docs`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
