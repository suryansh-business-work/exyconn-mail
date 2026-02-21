export interface MailEventDto {
  messageId: string;
  from: string;
  to: string;
  subject?: string;
  status: string;
  size?: number;
  postfixQueueId?: string;
  clientIp?: string;
  tlsUsed?: boolean;
  smtpResponse?: string;
}

export function validateMailEventDto(body: unknown): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const data = body as Record<string, unknown>;

  if (!data.messageId || typeof data.messageId !== "string") {
    errors.push("messageId is required");
  }

  if (!data.from || typeof data.from !== "string") {
    errors.push("from address is required");
  }

  if (!data.to || typeof data.to !== "string") {
    errors.push("to address is required");
  }

  if (!data.status || typeof data.status !== "string") {
    errors.push("status is required");
  } else {
    const validStatuses = [
      "queued",
      "sent",
      "delivered",
      "bounced",
      "deferred",
      "rejected",
      "received",
    ];
    if (!validStatuses.includes(data.status)) {
      errors.push(`status must be one of: ${validStatuses.join(", ")}`);
    }
  }

  return { valid: errors.length === 0, errors };
}
