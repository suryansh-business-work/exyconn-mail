import mongoose, { Schema, Document, Types } from "mongoose";

export type DomainStatus = "pending" | "active" | "suspended" | "dns-pending";

export interface IDnsRecord {
  type: "MX" | "TXT" | "CNAME";
  name: string;
  value: string;
  verified: boolean;
  lastChecked?: Date;
}

export interface IDomain extends Document {
  name: string;
  owner: Types.ObjectId;
  status: DomainStatus;
  dnsRecords: IDnsRecord[];
  mxVerified: boolean;
  spfVerified: boolean;
  dkimVerified: boolean;
  dmarcVerified: boolean;
  dkimPublicKey?: string;
  dkimPrivateKey?: string;
  dkimSelector: string;
  maxMailboxes: number;
  mailboxCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const dnsRecordSchema = new Schema<IDnsRecord>(
  {
    type: {
      type: String,
      enum: ["MX", "TXT", "CNAME"],
      required: true,
    },
    name: { type: String, required: true },
    value: { type: String, required: true },
    verified: { type: Boolean, default: false },
    lastChecked: { type: Date },
  },
  { _id: false },
);

const domainSchema = new Schema<IDomain>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "active", "suspended", "dns-pending"],
      default: "dns-pending",
    },
    dnsRecords: [dnsRecordSchema],
    mxVerified: { type: Boolean, default: false },
    spfVerified: { type: Boolean, default: false },
    dkimVerified: { type: Boolean, default: false },
    dmarcVerified: { type: Boolean, default: false },
    dkimPublicKey: { type: String },
    dkimPrivateKey: { type: String },
    dkimSelector: { type: String, default: "default" },
    maxMailboxes: { type: Number, default: -1 }, // -1 for unlimited
    mailboxCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);

domainSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.dkimPrivateKey;
    return ret;
  },
});

export const Domain = mongoose.model<IDomain>("Domain", domainSchema);
export default Domain;
