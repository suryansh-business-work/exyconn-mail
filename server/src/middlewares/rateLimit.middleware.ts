import rateLimit from 'express-rate-limit';
import config from '../config/index';

export const apiLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 login attempts per 15 min
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const webhookLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200, // 200 webhook events per minute
  message: {
    success: false,
    message: 'Too many webhook events.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
