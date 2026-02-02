import mongoose, { Document, Schema, Types } from 'mongoose';
import crypto from 'crypto';

export interface IMailbox extends Document {
  domainId: Types.ObjectId;
  email: string;
  username: string;
  passwordHash: string;
  displayName: string;
  quota: number;
  usedQuota: number;
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
  validatePassword(password: string): boolean;
}

const mailboxSchema = new Schema<IMailbox>(
  {
    domainId: {
      type: Schema.Types.ObjectId,
      ref: 'Domain',
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    displayName: {
      type: String,
      trim: true,
      default: '',
    },
    quota: {
      type: Number,
      default: 1073741824, // 1GB in bytes
    },
    usedQuota: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster lookups
mailboxSchema.index({ domainId: 1, username: 1 }, { unique: true });

// Hash password before saving
mailboxSchema.pre('save', function (next) {
  if (this.isModified('passwordHash') && !this.passwordHash.startsWith('$')) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(this.passwordHash, salt, 10000, 64, 'sha512').toString('hex');
    this.passwordHash = `$pbkdf2$${salt}$${hash}`;
  }
  next();
});

// Validate password method
mailboxSchema.methods.validatePassword = function (password: string): boolean {
  const parts = this.passwordHash.split('$');
  if (parts.length !== 4) return false;
  const salt = parts[2];
  const storedHash = parts[3];
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === storedHash;
};

export const Mailbox = mongoose.model<IMailbox>('Mailbox', mailboxSchema);
