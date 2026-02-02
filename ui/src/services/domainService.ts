import api from "./api";

export interface DKIMConfig {
  selector: string;
  privateKey: string;
  publicKey: string;
}

export interface Domain {
  _id: string;
  name: string;
  mxHost: string;
  mxPriority: number;
  smtpPort: number;
  imapPort: number;
  pop3Port: number;
  dkim: DKIMConfig | null;
  spfRecord: string;
  dmarcRecord: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DNSRecord {
  type: string;
  host: string;
  value: string;
  priority?: number;
  description: string;
}

export interface DomainInput {
  name: string;
  mxHost: string;
  mxPriority?: number;
  smtpPort?: number;
  imapPort?: number;
  pop3Port?: number;
  spfRecord?: string;
  dmarcRecord?: string;
  isActive?: boolean;
}

export interface DomainQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  isVerified?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
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

export const domainService = {
  async getAll(
    params: DomainQueryParams = {},
  ): Promise<PaginatedResponse<Domain>> {
    const response = await api.get("/domains", { params });
    return response.data;
  },

  async getById(id: string): Promise<{ success: boolean; data: Domain }> {
    const response = await api.get(`/domains/${id}`);
    return response.data;
  },

  async create(data: DomainInput): Promise<{ success: boolean; data: Domain }> {
    const response = await api.post("/domains", data);
    return response.data;
  },

  async update(
    id: string,
    data: Partial<DomainInput>,
  ): Promise<{ success: boolean; data: Domain }> {
    const response = await api.put(`/domains/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/domains/${id}`);
    return response.data;
  },

  async generateDKIM(
    id: string,
    selector: string = "mail",
  ): Promise<{ success: boolean; data: Domain }> {
    const response = await api.post(`/domains/${id}/generate-dkim`, {
      selector,
    });
    return response.data;
  },

  async verify(
    id: string,
  ): Promise<{ success: boolean; verified: boolean; errors: string[] }> {
    const response = await api.post(`/domains/${id}/verify`);
    return response.data;
  },

  async getDNSRecords(
    id: string,
  ): Promise<{ success: boolean; domain: Domain; records: DNSRecord[] }> {
    const response = await api.get(`/domains/${id}/dns-records`);
    return response.data;
  },
};
