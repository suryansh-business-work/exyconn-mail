import mongoose, { Schema, Document, Types } from "mongoose";
import bcrypt from "bcrypt";

export type MailboxStatus = "active" | "suspended" | "disabled";

export interface IMailbox extends Document {
  email: string;
  localPart: string;
  domain: Types.ObjectId;
  domainName: string;
  password: string;
  name: string;
  quota: number; // in MB
  usedQuota: number; // in MB
  status: MailboxStatus;
  forwardTo?: string;
  isCatchAll: boolean;
  lastLogin?: Date;
  messageCount: number;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const mailboxSchema = new Schema<IMailbox>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    localPart: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    domain: {
      type: Schema.Types.ObjectId,
      ref: "Domain",
      required: true,
      index: true,
    },
    domainName: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    quota: {
      type: Number,
      default: 1024, // 1GB default
    },
    usedQuota: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "suspended", "disabled"],
      default: "active",
    },
    forwardTo: {
      type: String,
      lowercase: true,
    },
    isCatchAll: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
    },
    messageCount: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

mailboxSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

mailboxSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

mailboxSchema.set("toJSON", {
  transform: (_doc, ret) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _pw, ...rest } = ret;
    return rest;
  },
});

export const Mailbox = mongoose.model<IMailbox>("Mailbox", mailboxSchema);
export default Mailbox;
