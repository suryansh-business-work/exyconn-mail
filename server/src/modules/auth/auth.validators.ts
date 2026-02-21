export interface RegisterDto {
  email: string;
  password: string;
  name: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function validateRegisterDto(body: unknown): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const data = body as Record<string, unknown>;

  if (!data.email || typeof data.email !== 'string') {
    errors.push('Email is required and must be a string');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Invalid email format');
  }

  if (!data.password || typeof data.password !== 'string') {
    errors.push('Password is required and must be a string');
  } else if (data.password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (!data.name || typeof data.name !== 'string') {
    errors.push('Name is required and must be a string');
  } else if (data.name.length < 2) {
    errors.push('Name must be at least 2 characters');
  }

  return { valid: errors.length === 0, errors };
}

export function validateLoginDto(body: unknown): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const data = body as Record<string, unknown>;

  if (!data.email || typeof data.email !== 'string') {
    errors.push('Email is required');
  }

  if (!data.password || typeof data.password !== 'string') {
    errors.push('Password is required');
  }

  return { valid: errors.length === 0, errors };
}
