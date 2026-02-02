import mongoose, { Document, Schema, Types } from "mongoose";

export interface IEmailAttachment {
  fileName: string;
  mimeType: string;
  size: number;
  url: string;
  fileId: string;
}

export interface IEmail extends Document {
  mailboxId: Types.ObjectId;
  messageId: string;
  from: string;
  to: string[];
  cc: string[];
  bcc: string[];
  replyTo: string;
  subject: string;
  textBody: string;
  htmlBody: string;
  attachments: IEmailAttachment[];
  isRead: boolean;
  isStarred: boolean;
  folder: "inbox" | "sent" | "drafts" | "trash" | "spam";
  size: number;
  receivedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const emailAttachmentSchema = new Schema<IEmailAttachment>(
  {
    fileName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    url: { type: String, required: true },
    fileId: { type: String, required: true },
  },
  { _id: false },
);

const emailSchema = new Schema<IEmail>(
  {
    mailboxId: {
      type: Schema.Types.ObjectId,
      ref: "Mailbox",
      required: true,
    },
    messageId: {
      type: String,
      required: true,
      unique: true,
    },
    from: {
      type: String,
      required: true,
      trim: true,
    },
    to: [{ type: String, trim: true }],
    cc: [{ type: String, trim: true }],
    bcc: [{ type: String, trim: true }],
    replyTo: {
      type: String,
      trim: true,
      default: "",
    },
    subject: {
      type: String,
      default: "(No Subject)",
    },
    textBody: {
      type: String,
      default: "",
    },
    htmlBody: {
      type: String,
      default: "",
    },
    attachments: [emailAttachmentSchema],
    isRead: {
      type: Boolean,
      default: false,
    },
    isStarred: {
      type: Boolean,
      default: false,
    },
    folder: {
      type: String,
      enum: ["inbox", "sent", "drafts", "trash", "spam"],
      default: "inbox",
    },
    size: {
      type: Number,
      default: 0,
    },
    receivedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

emailSchema.index({ mailboxId: 1, folder: 1, receivedAt: -1 });
emailSchema.index({ from: "text", subject: "text", textBody: "text" });

export const Email = mongoose.model<IEmail>("Email", emailSchema);
