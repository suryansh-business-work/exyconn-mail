import { z } from 'zod';

const emailAddressRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const sendEmailSchema = z.object({
  from: z.string().regex(emailAddressRegex, 'Invalid from email address'),
  to: z.array(z.string().regex(emailAddressRegex, 'Invalid email address')).min(1),
  cc: z.array(z.string().regex(emailAddressRegex, 'Invalid email address')).optional().default([]),
  bcc: z.array(z.string().regex(emailAddressRegex, 'Invalid email address')).optional().default([]),
  replyTo: z.string().regex(emailAddressRegex).optional(),
  subject: z.string().max(500).optional().default(''),
  textBody: z.string().optional().default(''),
  htmlBody: z.string().optional().default(''),
});

export const emailIdSchema = z.object({
  id: z.string().regex(objectIdRegex, 'Invalid ID format'),
});

export const emailQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  folder: z.enum(['inbox', 'sent', 'drafts', 'trash', 'spam']).optional(),
  mailboxId: z.string().regex(objectIdRegex).optional(),
  isRead: z.coerce.boolean().optional(),
  isStarred: z.coerce.boolean().optional(),
  sortBy: z.enum(['receivedAt', 'createdAt', 'subject']).default('receivedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const updateEmailSchema = z.object({
  isRead: z.boolean().optional(),
  isStarred: z.boolean().optional(),
  folder: z.enum(['inbox', 'sent', 'drafts', 'trash', 'spam']).optional(),
});

export const replyEmailSchema = z.object({
  textBody: z.string().min(1, 'Reply body is required'),
  htmlBody: z.string().optional().default(''),
});

export type SendEmailInput = z.infer<typeof sendEmailSchema>;
export type EmailQueryInput = z.infer<typeof emailQuerySchema>;
export type UpdateEmailInput = z.infer<typeof updateEmailSchema>;
export type ReplyEmailInput = z.infer<typeof replyEmailSchema>;
