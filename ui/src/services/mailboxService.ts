import api from './api';

export interface Mailbox {
  _id: string;
  email: string;
  name: string;
  quotaLimit: number;
  quotaUsed: number;
  forwardTo?: string;
  autoReply: boolean;
  autoReplyMessage?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MailboxInput {
  email: string;
  password: string;
  name?: string;
  quotaLimit?: number;
  forwardTo?: string;
  autoReply?: boolean;
  autoReplyMessage?: string;
  isActive?: boolean;
}

export interface MailboxUpdateInput {
  name?: string;
  password?: string;
  quotaLimit?: number;
  forwardTo?: string;
  autoReply?: boolean;
  autoReplyMessage?: string;
  isActive?: boolean;
}

export interface MailboxQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  domainId?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const mailboxService = {
  async getAll(params: MailboxQueryParams = {}): Promise<PaginatedResponse<Mailbox>> {
    const response = await api.get('/mailboxes', { params });
    return response.data;
  },

  async getById(id: string): Promise<{ success: boolean; data: Mailbox }> {
    const response = await api.get(`/mailboxes/${id}`);
    return response.data;
  },

  async create(data: MailboxInput): Promise<{ success: boolean; data: Mailbox }> {
    const response = await api.post('/mailboxes', data);
    return response.data;
  },

  async update(id: string, data: MailboxUpdateInput): Promise<{ success: boolean; data: Mailbox }> {
    const response = await api.put(`/mailboxes/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/mailboxes/${id}`);
    return response.data;
  },

  async authenticate(
    email: string,
    password: string
  ): Promise<{ success: boolean; data: { email: string; displayName: string } }> {
    const response = await api.post('/mailboxes/authenticate', { email, password });
    return response.data;
  },
};
