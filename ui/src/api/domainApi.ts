import apiClient from "./apiClient";

export interface Domain {
  _id: string;
  name: string;
  owner: { _id: string; name: string; email: string };
  status: "pending" | "active" | "suspended" | "dns-pending";
  dnsRecords: Array<{
    type: "MX" | "TXT" | "CNAME";
    name: string;
    value: string;
    verified: boolean;
    lastChecked?: string;
  }>;
  mxVerified: boolean;
  spfVerified: boolean;
  dkimVerified: boolean;
  dmarcVerified: boolean;
  maxMailboxes: number;
  mailboxCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    domains?: T[];
    mailboxes?: T[];
    logs?: T[];
    total: number;
    page: number;
    totalPages: number;
  };
}

export interface DomainFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const domainApi = {
  getAll: (filters?: DomainFilters) =>
    apiClient.get<PaginatedResponse<Domain>>("/domains", { params: filters }),
  getById: (id: string) =>
    apiClient.get<{ success: boolean; data: { domain: Domain } }>(
      `/domains/${id}`,
    ),
  create: (name: string) =>
    apiClient.post<{ success: boolean; data: { domain: Domain } }>("/domains", {
      name,
    }),
  update: (id: string, data: Partial<Domain>) =>
    apiClient.patch(`/domains/${id}`, data),
  delete: (id: string) => apiClient.delete(`/domains/${id}`),
  verifyDns: (id: string) => apiClient.post(`/domains/${id}/verify-dns`),
  getDnsInstructions: (id: string) =>
    apiClient.get(`/domains/${id}/dns-instructions`),
};
