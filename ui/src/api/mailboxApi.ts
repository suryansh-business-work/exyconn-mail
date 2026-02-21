import apiClient from "./apiClient";

export interface Mailbox {
  _id: string;
  email: string;
  localPart: string;
  domain: { _id: string; name: string; status: string };
  domainName: string;
  name: string;
  quota: number;
  usedQuota: number;
  status: "active" | "suspended" | "disabled";
  forwardTo?: string;
  isCatchAll: boolean;
  lastLogin?: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MailboxFilters {
  page?: number;
  limit?: number;
  search?: string;
  domainId?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateMailboxPayload {
  localPart: string;
  domainId: string;
  password: string;
  name: string;
  quota?: number;
}

export interface UpdateMailboxPayload {
  name?: string;
  quota?: number;
  status?: string;
  forwardTo?: string;
  isCatchAll?: boolean;
}

export const mailboxApi = {
  getAll: (filters?: MailboxFilters) =>
    apiClient.get("/mailboxes", { params: filters }),
  getById: (id: string) =>
    apiClient.get<{ success: boolean; data: { mailbox: Mailbox } }>(
      `/mailboxes/${id}`,
    ),
  create: (payload: CreateMailboxPayload) =>
    apiClient.post("/mailboxes", payload),
  update: (id: string, payload: UpdateMailboxPayload) =>
    apiClient.patch(`/mailboxes/${id}`, payload),
  suspend: (id: string) => apiClient.post(`/mailboxes/${id}/suspend`),
  activate: (id: string) => apiClient.post(`/mailboxes/${id}/activate`),
  delete: (id: string) => apiClient.delete(`/mailboxes/${id}`),
  changePassword: (id: string, password: string) =>
    apiClient.patch(`/mailboxes/${id}/password`, { password }),
};
