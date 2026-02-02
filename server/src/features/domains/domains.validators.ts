import { z } from 'zod';

export const createDomainSchema = z.object({
  name: z
    .string()
    .min(3, 'Domain name must be at least 3 characters')
    .regex(/^[a-z0-9][a-z0-9-]*\.[a-z]{2,}$/i, 'Invalid domain format'),
  mxHost: z.string().min(1, 'MX host is required'),
  mxPriority: z.number().min(1).max(100).optional().default(10),
  smtpPort: z.number().min(1).max(65535).optional().default(25),
  imapPort: z.number().min(1).max(65535).optional().default(993),
  pop3Port: z.number().min(1).max(65535).optional().default(995),
  spfRecord: z.string().optional().default(''),
  dmarcRecord: z.string().optional().default(''),
});

export const updateDomainSchema = z.object({
  name: z
    .string()
    .min(3, 'Domain name must be at least 3 characters')
    .regex(/^[a-z0-9][a-z0-9-]*\.[a-z]{2,}$/i, 'Invalid domain format')
    .optional(),
  mxHost: z.string().min(1).optional(),
  mxPriority: z.number().min(1).max(100).optional(),
  smtpPort: z.number().min(1).max(65535).optional(),
  imapPort: z.number().min(1).max(65535).optional(),
  pop3Port: z.number().min(1).max(65535).optional(),
  spfRecord: z.string().optional(),
  dmarcRecord: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const queryDomainsSchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(10),
  search: z.string().optional(),
  isActive: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  isVerified: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const generateDKIMSchema = z.object({
  selector: z.string().min(1, 'DKIM selector is required').optional().default('mail'),
});

export type CreateDomainInput = z.infer<typeof createDomainSchema>;
export type UpdateDomainInput = z.infer<typeof updateDomainSchema>;
export type QueryDomainsInput = z.infer<typeof queryDomainsSchema>;
export type GenerateDKIMInput = z.infer<typeof generateDKIMSchema>;
