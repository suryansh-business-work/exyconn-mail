import MailLog, { IMailLog, MailDirection, MailStatus } from './mailLog.model';
import Domain from '../domain/domain.model';
import Mailbox from '../mailbox/mailbox.model';
import { MailEventDto } from './mail.validators';

export class MailService {
  async logMailEvent(dto: MailEventDto): Promise<IMailLog> {
    // Determine direction
    const fromDomain = dto.from.split('@')[1]?.toLowerCase();
    const toDomain = dto.to.split('@')[1]?.toLowerCase();

    let direction: MailDirection = 'inbound';
    let domainDoc = await Domain.findOne({ name: toDomain });

    if (!domainDoc) {
      domainDoc = await Domain.findOne({ name: fromDomain });
      if (domainDoc) {
        direction = 'outbound';
      }
    }

    // Find associated mailbox
    const mailboxEmail = direction === 'inbound' ? dto.to : dto.from;
    const mailbox = await Mailbox.findOne({
      email: mailboxEmail.toLowerCase(),
    });

    const mailLog = new MailLog({
      messageId: dto.messageId,
      from: dto.from.toLowerCase(),
      to: dto.to.toLowerCase(),
      subject: dto.subject || '(no subject)',
      direction,
      status: dto.status as MailStatus,
      size: dto.size || 0,
      domain: domainDoc?._id,
      mailbox: mailbox?._id,
      smtpResponse: dto.smtpResponse,
      postfixQueueId: dto.postfixQueueId,
      clientIp: dto.clientIp,
      tlsUsed: dto.tlsUsed || false,
    });

    await mailLog.save();

    // Update mailbox message count
    if (mailbox && dto.status === 'delivered') {
      mailbox.messageCount += 1;
      await mailbox.save();
    }

    return mailLog;
  }

  async getLogs(filters: {
    domainId?: string;
    mailboxId?: string;
    direction?: string;
    status?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    startDate?: string;
    endDate?: string;
  }): Promise<{
    logs: IMailLog[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 20,
      domainId,
      mailboxId,
      direction,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      startDate,
      endDate,
    } = filters;

    const query: Record<string, unknown> = {};
    if (domainId) query.domain = domainId;
    if (mailboxId) query.mailbox = mailboxId;
    if (direction) query.direction = direction;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { from: { $regex: search, $options: 'i' } },
        { to: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
      ];
    }
    if (startDate || endDate) {
      const dateQuery: Record<string, Date> = {};
      if (startDate) dateQuery.$gte = new Date(startDate);
      if (endDate) dateQuery.$lte = new Date(endDate);
      query.createdAt = dateQuery;
    }

    const total = await MailLog.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const logs = await MailLog.find(query)
      .populate('domain', 'name')
      .populate('mailbox', 'email name')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    return { logs, total, page, totalPages };
  }

  async getLogById(id: string): Promise<IMailLog> {
    const log = await MailLog.findById(id)
      .populate('domain', 'name')
      .populate('mailbox', 'email name');
    if (!log) {
      throw new Error('Mail log not found');
    }
    return log;
  }

  async getStats(domainId?: string): Promise<{
    totalEmails: number;
    inbound: number;
    outbound: number;
    delivered: number;
    bounced: number;
    rejected: number;
    todayTotal: number;
    weekTotal: number;
  }> {
    const baseQuery: Record<string, unknown> = {};
    if (domainId) baseQuery.domain = domainId;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [totalEmails, inbound, outbound, delivered, bounced, rejected, todayTotal, weekTotal] =
      await Promise.all([
        MailLog.countDocuments(baseQuery),
        MailLog.countDocuments({ ...baseQuery, direction: 'inbound' }),
        MailLog.countDocuments({ ...baseQuery, direction: 'outbound' }),
        MailLog.countDocuments({ ...baseQuery, status: 'delivered' }),
        MailLog.countDocuments({ ...baseQuery, status: 'bounced' }),
        MailLog.countDocuments({ ...baseQuery, status: 'rejected' }),
        MailLog.countDocuments({ ...baseQuery, createdAt: { $gte: today } }),
        MailLog.countDocuments({ ...baseQuery, createdAt: { $gte: weekAgo } }),
      ]);

    return {
      totalEmails,
      inbound,
      outbound,
      delivered,
      bounced,
      rejected,
      todayTotal,
      weekTotal,
    };
  }
}

export default new MailService();
