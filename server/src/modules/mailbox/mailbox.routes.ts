import { Router } from "express";
import {
  createMailbox,
  getMailboxes,
  getMailboxById,
  updateMailbox,
  suspendMailbox,
  activateMailbox,
  deleteMailbox,
  changeMailboxPassword,
} from "./mailbox.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";

const router = Router();

/**
 * @swagger
 * /api/mailboxes:
 *   post:
 *     tags: [Mailboxes]
 *     summary: Create a new mailbox
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [localPart, domainId, password, name]
 *             properties:
 *               localPart: { type: string, example: "john" }
 *               domainId: { type: string }
 *               password: { type: string, minLength: 8 }
 *               name: { type: string, example: "John Doe" }
 *               quota: { type: number, example: 1024 }
 *     responses:
 *       201: { description: Mailbox created }
 */
router.post(
  "/",
  authenticate,
  authorize("admin", "domain-owner"),
  createMailbox,
);

/**
 * @swagger
 * /api/mailboxes:
 *   get:
 *     tags: [Mailboxes]
 *     summary: Get all mailboxes
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: domainId
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [active, suspended, disabled] }
 */
router.get("/", authenticate, getMailboxes);

/**
 * @swagger
 * /api/mailboxes/{id}:
 *   get:
 *     tags: [Mailboxes]
 *     summary: Get a mailbox by ID
 *     security: [{ bearerAuth: [] }]
 */
router.get("/:id", authenticate, getMailboxById);

/**
 * @swagger
 * /api/mailboxes/{id}:
 *   patch:
 *     tags: [Mailboxes]
 *     summary: Update a mailbox
 *     security: [{ bearerAuth: [] }]
 */
router.patch(
  "/:id",
  authenticate,
  authorize("admin", "domain-owner"),
  updateMailbox,
);

/**
 * @swagger
 * /api/mailboxes/{id}/suspend:
 *   post:
 *     tags: [Mailboxes]
 *     summary: Suspend a mailbox
 *     security: [{ bearerAuth: [] }]
 */
router.post(
  "/:id/suspend",
  authenticate,
  authorize("admin", "domain-owner"),
  suspendMailbox,
);

/**
 * @swagger
 * /api/mailboxes/{id}/activate:
 *   post:
 *     tags: [Mailboxes]
 *     summary: Activate a mailbox
 *     security: [{ bearerAuth: [] }]
 */
router.post(
  "/:id/activate",
  authenticate,
  authorize("admin", "domain-owner"),
  activateMailbox,
);

/**
 * @swagger
 * /api/mailboxes/{id}:
 *   delete:
 *     tags: [Mailboxes]
 *     summary: Delete a mailbox
 *     security: [{ bearerAuth: [] }]
 */
router.delete("/:id", authenticate, authorize("admin"), deleteMailbox);

/**
 * @swagger
 * /api/mailboxes/{id}/password:
 *   patch:
 *     tags: [Mailboxes]
 *     summary: Change mailbox password
 *     security: [{ bearerAuth: [] }]
 */
router.patch(
  "/:id/password",
  authenticate,
  authorize("admin", "domain-owner"),
  changeMailboxPassword,
);

export default router;
