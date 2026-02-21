import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '4032', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // MongoDB
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/exyconn-mail',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'exyconn-mail-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'exyconn-mail-refresh-secret',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',

  // Mail Server
  mailServerHostname: process.env.MAIL_SERVER_HOSTNAME || 'mail.exyconn.com',
  postfixMysqlHost: process.env.POSTFIX_MYSQL_HOST || 'localhost',
  postfixMysqlUser: process.env.POSTFIX_MYSQL_USER || 'postfix',
  postfixMysqlPassword: process.env.POSTFIX_MYSQL_PASSWORD || '',
  postfixMysqlDb: process.env.POSTFIX_MYSQL_DB || 'postfix',

  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 min
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),

  // CORS
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:4031'],

  // DKIM
  dkimSelector: process.env.DKIM_SELECTOR || 'default',
};

export default config;
