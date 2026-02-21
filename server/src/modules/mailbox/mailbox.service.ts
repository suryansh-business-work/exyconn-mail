import Mailbox, { IMailbox } from './mailbox.model';
import Domain from '../domain/domain.model';
import { CreateMailboxDto, UpdateMailboxDto } from './mailbox.validators';

export class MailboxService {
  async create(dto: CreateMailboxDto, createdBy: string): Promise<IMailbox> {
    const domain = await Domain.findById(dto.domainId);
    if (!domain) {
      throw new Error('Domain not found');
    }

    if (domain.status !== 'active') {
      throw new Error('Domain is not active. Please verify DNS first.');
    }

    if (domain.maxMailboxes !== -1 && domain.mailboxCount >= domain.maxMailboxes) {
      throw new Error('Maximum mailbox limit reached for this domain');
    }

    const email = `${dto.localPart.toLowerCase()}@${domain.name}`;
    const existing = await Mailbox.findOne({ email });
    if (existing) {
      throw new Error('Mailbox already exists');
    }

    const mailbox = new Mailbox({
      email,
      localPart: dto.localPart.toLowerCase(),
      domain: domain._id,
      domainName: domain.name,
      password: dto.password,
      name: dto.name,
      quota: dto.quota || 1024,
      createdBy,
    });

    await mailbox.save();

    // Update domain mailbox count
    domain.mailboxCount += 1;
    await domain.save();

    return mailbox;
  }

  async getAll(filters: {
    domainId?: string;
    domainName?: string;
    status?: string;
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    mailboxes: IMailbox[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      domainId,
      domainName,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    const query: Record<string, unknown> = {};
    if (domainId) query.domain = domainId;
    if (domainName) query.domainName = domainName;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Mailbox.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const mailboxes = await Mailbox.find(query)
      .populate('domain', 'name status')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    return { mailboxes, total, page, totalPages };
  }

  async getById(id: string): Promise<IMailbox> {
    const mailbox = await Mailbox.findById(id).populate('domain', 'name status');
    if (!mailbox) {
      throw new Error('Mailbox not found');
    }
    return mailbox;
  }

  async update(id: string, dto: UpdateMailboxDto): Promise<IMailbox> {
    const updateData: Record<string, unknown> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.quota !== undefined) updateData.quota = dto.quota;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.forwardTo !== undefined) updateData.forwardTo = dto.forwardTo;
    if (dto.isCatchAll !== undefined) updateData.isCatchAll = dto.isCatchAll;

    const mailbox = await Mailbox.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!mailbox) {
      throw new Error('Mailbox not found');
    }
    return mailbox;
  }

  async suspend(id: string): Promise<IMailbox> {
    return this.update(id, { status: 'suspended' });
  }

  async activate(id: string): Promise<IMailbox> {
    return this.update(id, { status: 'active' });
  }

  async delete(id: string): Promise<void> {
    const mailbox = await Mailbox.findById(id);
    if (!mailbox) {
      throw new Error('Mailbox not found');
    }

    // Decrease domain mailbox count
    await Domain.findByIdAndUpdate(mailbox.domain, {
      $inc: { mailboxCount: -1 },
    });
    await Mailbox.findByIdAndDelete(id);
  }

  async changePassword(id: string, newPassword: string): Promise<void> {
    const mailbox = await Mailbox.findById(id);
    if (!mailbox) {
      throw new Error('Mailbox not found');
    }
    mailbox.password = newPassword;
    await mailbox.save();
  }
}

export default new MailboxService();
