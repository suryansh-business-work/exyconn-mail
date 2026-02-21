export interface CreateMailboxDto {
  localPart: string;
  domainId: string;
  password: string;
  name: string;
  quota?: number;
}

export interface UpdateMailboxDto {
  name?: string;
  quota?: number;
  status?: 'active' | 'suspended' | 'disabled';
  forwardTo?: string;
  isCatchAll?: boolean;
}

export function validateCreateMailboxDto(body: unknown): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const data = body as Record<string, unknown>;

  if (!data.localPart || typeof data.localPart !== 'string') {
    errors.push('Local part (username) is required');
  } else if (!/^[a-zA-Z0-9._%+-]+$/.test(data.localPart)) {
    errors.push('Invalid local part format');
  }

  if (!data.domainId || typeof data.domainId !== 'string') {
    errors.push('Domain ID is required');
  }

  if (!data.password || typeof data.password !== 'string') {
    errors.push('Password is required');
  } else if (data.password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (!data.name || typeof data.name !== 'string') {
    errors.push('Display name is required');
  }

  if (data.quota !== undefined) {
    if (typeof data.quota !== 'number' || data.quota < 1) {
      errors.push('Quota must be a positive number (in MB)');
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateUpdateMailboxDto(body: unknown): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const data = body as Record<string, unknown>;

  if (data.quota !== undefined) {
    if (typeof data.quota !== 'number' || data.quota < 1) {
      errors.push('Quota must be a positive number');
    }
  }

  if (data.status !== undefined) {
    if (!['active', 'suspended', 'disabled'].includes(data.status as string)) {
      errors.push('Status must be active, suspended, or disabled');
    }
  }

  if (data.forwardTo !== undefined && data.forwardTo !== null) {
    if (typeof data.forwardTo !== 'string') {
      errors.push('Forward-to must be a string');
    } else if (data.forwardTo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.forwardTo)) {
      errors.push('Invalid forward-to email format');
    }
  }

  return { valid: errors.length === 0, errors };
}
