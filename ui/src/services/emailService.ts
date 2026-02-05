import api from "./api";

export interface Email {
  _id: string;
  mailboxId: {
    _id: string;
    email: string;
    displayName: string;
  };
  messageId: string;
  from: string;
  to: string[];
  cc: string[];
  bcc: string[];
  replyTo: string;
  subject: string;
  textBody: string;
  htmlBody: string;
  attachments: {
    fileName: string;
    mimeType: string;
    size: number;
    url: string;
    fileId: string;
  }[];
  isRead: boolean;
  isStarred: boolean;
  folder: "inbox" | "sent" | "drafts" | "trash" | "spam";
  size: number;
  receivedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface SendEmailInput {
  mailboxId: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  replyTo?: string;
  subject?: string;
  textBody?: string;
  htmlBody?: string;
}

export interface EmailQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  folder?: string;
  mailboxId?: string;
  isRead?: boolean;
  isStarred?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedEmailResponse {
  success: boolean;
  data: Email[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const emailService = {
  async getAll(params: EmailQueryParams = {}): Promise<PaginatedEmailResponse> {
    const response = await api.get("/emails", { params });
    return response.data;
  },

  async getById(id: string): Promise<{ success: boolean; data: Email }> {
    const response = await api.get(`/emails/${id}`);
    return response.data;
  },

  async send(data: SendEmailInput): Promise<{ success: boolean; data: Email }> {
    const response = await api.post("/emails/send", data);
    return response.data;
  },

  async update(
    id: string,
    data: { isRead?: boolean; isStarred?: boolean; folder?: string },
  ): Promise<{ success: boolean; data: Email }> {
    const response = await api.put(`/emails/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/emails/${id}`);
    return response.data;
  },

  async moveToTrash(id: string): Promise<{ success: boolean; data: Email }> {
    const response = await api.post(`/emails/${id}/trash`);
    return response.data;
  },

  async toggleStar(id: string): Promise<{ success: boolean; data: Email }> {
    const response = await api.post(`/emails/${id}/star`);
    return response.data;
  },

  async reply(
    id: string,
    data: { textBody: string; htmlBody?: string },
  ): Promise<{ success: boolean; data: Email }> {
    const response = await api.post(`/emails/${id}/reply`, data);
    return response.data;
  },
};
