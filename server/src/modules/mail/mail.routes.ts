import { Router } from "express";
import {
  handleMailEvent,
  getMailLogs,
  getMailLogById,
  getMailStats,
} from "./mail.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";

const router = Router();

/**
 * @swagger
 * /api/mail/events:
 *   post:
 *     tags: [Mail]
 *     summary: Webhook endpoint for Postfix mail events
 *     description: Receives mail events from Postfix and stores them as logs
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [messageId, from, to, status]
 *             properties:
 *               messageId: { type: string }
 *               from: { type: string }
 *               to: { type: string }
 *               subject: { type: string }
 *               status: { type: string, enum: [queued, sent, delivered, bounced, deferred, rejected, received] }
 *               size: { type: number }
 *               postfixQueueId: { type: string }
 *               clientIp: { type: string }
 *               tlsUsed: { type: boolean }
 *               smtpResponse: { type: string }
 *     responses:
 *       201: { description: Mail event logged }
 */
router.post("/events", handleMailEvent);

/**
 * @swagger
 * /api/mail/logs:
 *   get:
 *     tags: [Mail]
 *     summary: Get mail logs
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: direction
 *         schema: { type: string, enum: [inbound, outbound] }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: domainId
 *         schema: { type: string }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 */
router.get("/logs", authenticate, getMailLogs);

/**
 * @swagger
 * /api/mail/logs/{id}:
 *   get:
 *     tags: [Mail]
 *     summary: Get a mail log by ID
 *     security: [{ bearerAuth: [] }]
 */
router.get("/logs/:id", authenticate, getMailLogById);

/**
 * @swagger
 * /api/mail/stats:
 *   get:
 *     tags: [Mail]
 *     summary: Get mail statistics
 *     security: [{ bearerAuth: [] }]
 */
router.get("/stats", authenticate, getMailStats);

/**
 * @swagger
 * /api/mail/stats/dashboard:
 *   get:
 *     tags: [Mail]
 *     summary: Get dashboard statistics (admin)
 *     security: [{ bearerAuth: [] }]
 */
router.get("/stats/dashboard", authenticate, authorize("admin"), getMailStats);

export default router;
