import { Router } from "express";
import {
  register,
  login,
  refreshToken,
  getProfile,
  updateUserRole,
} from "./auth.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name]
 *             properties:
 *               email: { type: string }
 *               password: { type: string, minLength: 8 }
 *               name: { type: string }
 *     responses:
 *       201: { description: User registered successfully }
 *       409: { description: User already exists }
 */
router.post("/register", register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful }
 *       401: { description: Invalid credentials }
 */
router.post("/login", login);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token
 */
router.post("/refresh", refreshToken);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user profile
 *     security: [{ bearerAuth: [] }]
 */
router.get("/profile", authenticate, getProfile);

/**
 * @swagger
 * /api/auth/users/{id}/role:
 *   patch:
 *     tags: [Auth]
 *     summary: Update user role (admin only)
 *     security: [{ bearerAuth: [] }]
 */
router.patch(
  "/users/:id/role",
  authenticate,
  authorize("admin"),
  updateUserRole,
);

export default router;
