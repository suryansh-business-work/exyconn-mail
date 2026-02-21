import { Router } from 'express';
import {
  createDomain,
  getDomains,
  getDomainById,
  updateDomain,
  deleteDomain,
  verifyDomainDns,
  getDnsInstructions,
} from './domain.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/domains:
 *   post:
 *     tags: [Domains]
 *     summary: Register a new domain
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, example: "example.com" }
 *     responses:
 *       201: { description: Domain created }
 */
router.post('/', authenticate, authorize('admin', 'domain-owner'), createDomain);

/**
 * @swagger
 * /api/domains:
 *   get:
 *     tags: [Domains]
 *     summary: Get all domains (admin sees all, owner sees own)
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
 *         name: status
 *         schema: { type: string, enum: [pending, active, suspended, dns-pending] }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, default: createdAt }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc] }
 */
router.get('/', authenticate, getDomains);

/**
 * @swagger
 * /api/domains/{id}:
 *   get:
 *     tags: [Domains]
 *     summary: Get a domain by ID
 *     security: [{ bearerAuth: [] }]
 */
router.get('/:id', authenticate, getDomainById);

/**
 * @swagger
 * /api/domains/{id}:
 *   patch:
 *     tags: [Domains]
 *     summary: Update a domain
 *     security: [{ bearerAuth: [] }]
 */
router.patch('/:id', authenticate, authorize('admin', 'domain-owner'), updateDomain);

/**
 * @swagger
 * /api/domains/{id}:
 *   delete:
 *     tags: [Domains]
 *     summary: Delete a domain (admin only)
 *     security: [{ bearerAuth: [] }]
 */
router.delete('/:id', authenticate, authorize('admin'), deleteDomain);

/**
 * @swagger
 * /api/domains/{id}/verify-dns:
 *   post:
 *     tags: [Domains]
 *     summary: Verify DNS records for a domain
 *     security: [{ bearerAuth: [] }]
 */
router.post('/:id/verify-dns', authenticate, verifyDomainDns);

/**
 * @swagger
 * /api/domains/{id}/dns-instructions:
 *   get:
 *     tags: [Domains]
 *     summary: Get DNS setup instructions for a domain
 *     security: [{ bearerAuth: [] }]
 */
router.get('/:id/dns-instructions', authenticate, getDnsInstructions);

export default router;
