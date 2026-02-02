import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import { Email, IEmail } from './emails.models';
import { Mailbox } from '../mailboxes/mailboxes.models';
import { SendEmailInput, EmailQueryInput, UpdateEmailInput } from './emails.validators';
import { mailboxesService } from '../mailboxes/mailboxes.services';

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const emailsService = {
  async sendEmail(input: SendEmailInput): Promise<IEmail> {
    // Find the sender's mailbox
    const senderMailbox = await Mailbox.findOne({ email: input.from.toLowerCase() }).populate(
      'domainId'
    );
    if (!senderMailbox) {
      throw new Error('Sender mailbox not found');
    }

    const domain = senderMailbox.domainId as unknown as { name: string; mxHost: string };

    const transporter = nodemailer.createTransport({
      host: domain.mxHost,
      port: 25,
      secure: false,
      tls: { rejectUnauthorized: false },
    });

    const messageId = `<${uuidv4()}@${domain.name}>`;

    const mailOptions = {
      from: input.from,
      to: input.to.join(', '),
      cc: input.cc?.join(', '),
      bcc: input.bcc?.join(', '),
      replyTo: input.replyTo || input.from,
      subject: input.subject || '(No Subject)',
      text: input.textBody,
      html: input.htmlBody || input.textBody,
      messageId,
    };

    await transporter.sendMail(mailOptions);

    const emailSize = Buffer.byteLength(JSON.stringify(mailOptions), 'utf8');

    const email = new Email({
      mailboxId: senderMailbox._id,
      messageId,
      from: input.from,
      to: input.to,
      cc: input.cc || [],
      bcc: input.bcc || [],
      replyTo: input.replyTo || input.from,
      subject: input.subject || '(No Subject)',
      textBody: input.textBody || '',
      htmlBody: input.htmlBody || '',
      folder: 'sent',
      size: emailSize,
      receivedAt: new Date(),
    });

    await email.save();
    await mailboxesService.updateQuotaUsage(input.from, emailSize);

    return email;
  },

  async getAll(query: EmailQueryInput): Promise<PaginatedResponse<IEmail>> {
    const { page, limit, search, folder, mailboxId, isRead, isStarred, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (folder) filter.folder = folder;
    if (mailboxId) filter.mailboxId = mailboxId;
    if (typeof isRead === 'boolean') filter.isRead = isRead;
    if (typeof isStarred === 'boolean') filter.isStarred = isStarred;
    if (search) {
      filter.$or = [
        { from: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { textBody: { $regex: search, $options: 'i' } },
      ];
    }

    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };

    const [data, total] = await Promise.all([
      Email.find(filter).populate('mailboxId', 'email displayName').sort(sort).skip(skip).limit(limit),
      Email.countDocuments(filter),
    ]);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getById(id: string): Promise<IEmail | null> {
    return await Email.findById(id).populate('mailboxId', 'email displayName');
  },

  async update(id: string, input: UpdateEmailInput): Promise<IEmail | null> {
    return await Email.findByIdAndUpdate(id, input, { new: true });
  },

  async delete(id: string): Promise<IEmail | null> {
    return await Email.findByIdAndDelete(id);
  },

  async moveToTrash(id: string): Promise<IEmail | null> {
    return await Email.findByIdAndUpdate(id, { folder: 'trash' }, { new: true });
  },

  async markAsRead(id: string): Promise<IEmail | null> {
    return await Email.findByIdAndUpdate(id, { isRead: true }, { new: true });
  },

  async toggleStar(id: string): Promise<IEmail | null> {
    const email = await Email.findById(id);
    if (!email) return null;
    return await Email.findByIdAndUpdate(id, { isStarred: !email.isStarred }, { new: true });
  },

  async saveIncomingEmail(emailData: {
    recipientEmail: string;
    messageId: string;
    from: string;
    to: string[];
    cc?: string[];
    replyTo?: string;
    subject?: string;
    textBody?: string;
    htmlBody?: string;
    receivedAt?: Date;
  }): Promise<IEmail | null> {
    const mailbox = await Mailbox.findOne({ email: emailData.recipientEmail.toLowerCase() });
    if (!mailbox) {
      console.log(`Mailbox not found for ${emailData.recipientEmail}`);
      return null;
    }

    const emailSize = Buffer.byteLength(JSON.stringify(emailData), 'utf8');

    const email = new Email({
      mailboxId: mailbox._id,
      messageId: emailData.messageId,
      from: emailData.from,
      to: emailData.to,
      cc: emailData.cc || [],
      replyTo: emailData.replyTo || emailData.from,
      subject: emailData.subject || '(No Subject)',
      textBody: emailData.textBody || '',
      htmlBody: emailData.htmlBody || '',
      folder: 'inbox',
      size: emailSize,
      receivedAt: emailData.receivedAt || new Date(),
    });

    await email.save();
    await mailboxesService.updateQuotaUsage(emailData.recipientEmail, emailSize);

    return email;
  },

  async getByMailbox(mailboxId: string, folder?: string): Promise<IEmail[]> {
    const filter: Record<string, unknown> = { mailboxId };
    if (folder) filter.folder = folder;
    return await Email.find(filter).sort({ receivedAt: -1 });
  },
};
