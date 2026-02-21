import apiClient from './apiClient';

export interface MailLog {
  _id: string;
  messageId: string;
  from: string;
  to: string;
  subject: string;
  direction: 'inbound' | 'outbound';
  status: string;
  size: number;
  domain?: { _id: string; name: string };
  mailbox?: { _id: string; email: string; name: string };
  smtpResponse?: string;
  postfixQueueId?: string;
  clientIp?: string;
  tlsUsed: boolean;
  spamScore?: number;
  isSpam: boolean;
  createdAt: string;
}

export interface MailLogFilters {
  page?: number;
  limit?: number;
  search?: string;
  direction?: string;
  status?: string;
  domainId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DashboardStats {
  domains: { total: number; active: number };
  mailboxes: { total: number; active: number };
  users: { total: number };
  mail: {
    totalEmails: number;
    inbound: number;
    outbound: number;
    delivered: number;
    bounced: number;
    rejected: number;
    todayTotal: number;
    weekTotal: number;
  };
}

export const mailApi = {
  getLogs: (filters?: MailLogFilters) => apiClient.get('/mail/logs', { params: filters }),
  getLogById: (id: string) => apiClient.get(`/mail/logs/${id}`),
  getStats: (domainId?: string) =>
    apiClient.get('/mail/stats', { params: domainId ? { domainId } : {} }),
  getDashboardStats: () =>
    apiClient.get<{ success: boolean; data: { stats: DashboardStats } }>('/dashboard/stats'),
};
