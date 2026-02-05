import { z } from "zod";

export const createMailboxSchema = z.object({
  domainId: z.string().min(1, "Domain ID is required"),
  username: z
    .string()
    .min(1, "Username is required")
    .max(64, "Username too long")
    .regex(/^[a-z0-9._-]+$/i, "Invalid username format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  displayName: z.string().optional().default(""),
  quota: z.number().min(1048576).optional().default(1073741824), // Min 1MB, default 1GB
});

export const updateMailboxSchema = z.object({
  displayName: z.string().optional(),
  password: z.string().min(8).optional(),
  quota: z.number().min(1048576).optional(),
  isActive: z.boolean().optional(),
});

export const queryMailboxesSchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(10),
  search: z.string().optional(),
  domainId: z.string().optional(),
  isActive: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  sortBy: z
    .enum(["email", "displayName", "createdAt", "lastLogin"])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const authenticateMailboxSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export type CreateMailboxInput = z.infer<typeof createMailboxSchema>;
export type UpdateMailboxInput = z.infer<typeof updateMailboxSchema>;
export type QueryMailboxesInput = z.infer<typeof queryMailboxesSchema>;
export type AuthenticateMailboxInput = z.infer<
  typeof authenticateMailboxSchema
>;
