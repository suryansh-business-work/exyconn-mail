import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { mailRouter } from './routes/mail';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4032;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/mail', mailRouter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'exyconn-mail-server' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Exyconn Mail Server running on port ${PORT}`);
});

export default app;
