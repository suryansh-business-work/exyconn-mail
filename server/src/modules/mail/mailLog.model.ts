import mongoose, { Schema, Document, Types } from "mongoose";

export type MailDirection = "inbound" | "outbound";
export type MailStatus =
  | "queued"
  | "sent"
  | "delivered"
  | "bounced"
  | "deferred"
  | "rejected"
  | "received";

export interface IMailLog extends Document {
  messageId: string;
  from: string;
  to: string;
  subject: string;
  direction: MailDirection;
  status: MailStatus;
  size: number; // bytes
  domain: Types.ObjectId;
  mailbox?: Types.ObjectId;
  smtpResponse?: string;
  headers?: Record<string, string>;
  postfixQueueId?: string;
  clientIp?: string;
  tlsUsed: boolean;
  spamScore?: number;
  isSpam: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const mailLogSchema = new Schema<IMailLog>(
  {
    messageId: {
      type: String,
      required: true,
      index: true,
    },
    from: {
      type: String,
      required: true,
      lowercase: true,
    },
    to: {
      type: String,
      required: true,
      lowercase: true,
    },
    subject: {
      type: String,
      default: "(no subject)",
    },
    direction: {
      type: String,
      enum: ["inbound", "outbound"],
      required: true,
    },
    status: {
      type: String,
      enum: [
        "queued",
        "sent",
        "delivered",
        "bounced",
        "deferred",
        "rejected",
        "received",
      ],
      required: true,
    },
    size: {
      type: Number,
      default: 0,
    },
    domain: {
      type: Schema.Types.ObjectId,
      ref: "Domain",
      index: true,
    },
    mailbox: {
      type: Schema.Types.ObjectId,
      ref: "Mailbox",
    },
    smtpResponse: { type: String },
    headers: { type: Schema.Types.Mixed },
    postfixQueueId: { type: String, index: true },
    clientIp: { type: String },
    tlsUsed: { type: Boolean, default: false },
    spamScore: { type: Number },
    isSpam: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

mailLogSchema.index({ createdAt: -1 });
mailLogSchema.index({ from: 1, createdAt: -1 });
mailLogSchema.index({ to: 1, createdAt: -1 });

export const MailLog = mongoose.model<IMailLog>("MailLog", mailLogSchema);
export default MailLog;
