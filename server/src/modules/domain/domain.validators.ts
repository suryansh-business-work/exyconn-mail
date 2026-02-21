export interface CreateDomainDto {
  name: string;
}

export interface UpdateDomainDto {
  status?: 'active' | 'suspended';
  maxMailboxes?: number;
}

export function validateCreateDomainDto(body: unknown): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const data = body as Record<string, unknown>;

  if (!data.name || typeof data.name !== 'string') {
    errors.push('Domain name is required');
  } else {
    const domainRegex = /^(?!-)([a-zA-Z0-9-]{1,63}(?<!-)\.)+[a-zA-Z]{2,}$/;
    if (!domainRegex.test(data.name)) {
      errors.push('Invalid domain name format');
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateUpdateDomainDto(body: unknown): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const data = body as Record<string, unknown>;

  if (data.status !== undefined) {
    if (!['active', 'suspended'].includes(data.status as string)) {
      errors.push('Status must be "active" or "suspended"');
    }
  }

  if (data.maxMailboxes !== undefined) {
    if (typeof data.maxMailboxes !== 'number' || data.maxMailboxes < -1) {
      errors.push('maxMailboxes must be a number >= -1');
    }
  }

  return { valid: errors.length === 0, errors };
}
