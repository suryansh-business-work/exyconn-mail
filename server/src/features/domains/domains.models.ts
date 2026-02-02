import mongoose, { Document, Schema } from 'mongoose';

export interface IDKIMConfig {
  selector: string;
  privateKey: string;
  publicKey: string;
}

export interface IDomain extends Document {
  name: string;
  mxHost: string;
  mxPriority: number;
  smtpPort: number;
  imapPort: number;
  pop3Port: number;
  dkim: IDKIMConfig | null;
  spfRecord: string;
  dmarcRecord: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const dkimConfigSchema = new Schema<IDKIMConfig>(
  {
    selector: { type: String, required: true },
    privateKey: { type: String, required: true },
    publicKey: { type: String, required: true },
  },
  { _id: false }
);

const domainSchema = new Schema<IDomain>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    mxHost: {
      type: String,
      required: true,
      trim: true,
    },
    mxPriority: {
      type: Number,
      default: 10,
    },
    smtpPort: {
      type: Number,
      default: 25,
    },
    imapPort: {
      type: Number,
      default: 993,
    },
    pop3Port: {
      type: Number,
      default: 995,
    },
    dkim: {
      type: dkimConfigSchema,
      default: null,
    },
    spfRecord: {
      type: String,
      default: '',
    },
    dmarcRecord: {
      type: String,
      default: '',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Domain = mongoose.model<IDomain>('Domain', domainSchema);
