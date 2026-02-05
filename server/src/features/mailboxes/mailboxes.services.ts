import { Mailbox, IMailbox } from "./mailboxes.models";
import { Domain } from "../domains/domains.models";
import {
  CreateMailboxInput,
  UpdateMailboxInput,
  QueryMailboxesInput,
} from "./mailboxes.validators";

export const mailboxesService = {
  async create(data: CreateMailboxInput): Promise<IMailbox> {
    const domain = await Domain.findById(data.domainId);
    if (!domain) {
      throw new Error("Domain not found");
    }

    const email = `${data.username.toLowerCase()}@${domain.name}`;

    const mailbox = new Mailbox({
      domainId: data.domainId,
      email,
      username: data.username.toLowerCase(),
      passwordHash: data.password,
      displayName: data.displayName || data.username,
      quota: data.quota,
    });

    await mailbox.save();
    return mailbox;
  },

  async getAll(query: QueryMailboxesInput) {
    const { page, limit, search, domainId, isActive, sortBy, sortOrder } =
      query;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: "i" } },
        { displayName: { $regex: search, $options: "i" } },
      ];
    }
    if (domainId) {
      filter.domainId = domainId;
    }
    if (typeof isActive === "boolean") {
      filter.isActive = isActive;
    }

    const sortOptions: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };

    const [mailboxes, total] = await Promise.all([
      Mailbox.find(filter)
        .select("-passwordHash")
        .populate("domainId", "name")
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      Mailbox.countDocuments(filter),
    ]);

    return {
      data: mailboxes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getById(id: string): Promise<IMailbox | null> {
    return Mailbox.findById(id)
      .select("-passwordHash")
      .populate("domainId", "name");
  },

  async getByEmail(email: string): Promise<IMailbox | null> {
    return Mailbox.findOne({ email: email.toLowerCase() }).populate("domainId");
  },

  async update(id: string, data: UpdateMailboxInput): Promise<IMailbox | null> {
    const updateData: Record<string, unknown> = { ...data };
    if (data.password) {
      updateData.passwordHash = data.password;
      delete updateData.password;
    }

    const mailbox = await Mailbox.findById(id);
    if (!mailbox) return null;

    Object.assign(mailbox, updateData);
    await mailbox.save();

    return Mailbox.findById(id)
      .select("-passwordHash")
      .populate("domainId", "name");
  },

  async delete(id: string): Promise<IMailbox | null> {
    return Mailbox.findByIdAndDelete(id);
  },

  async authenticate(
    email: string,
    password: string,
  ): Promise<IMailbox | null> {
    const mailbox = await Mailbox.findOne({
      email: email.toLowerCase(),
      isActive: true,
    });
    if (!mailbox) return null;

    const isValid = mailbox.validatePassword(password);
    if (!isValid) return null;

    mailbox.lastLogin = new Date();
    await mailbox.save();

    return mailbox;
  },

  async updateQuotaUsage(email: string, bytesUsed: number): Promise<void> {
    await Mailbox.findOneAndUpdate(
      { email: email.toLowerCase() },
      { $inc: { usedQuota: bytesUsed } },
    );
  },

  async getByDomain(domainId: string): Promise<IMailbox[]> {
    return Mailbox.find({ domainId }).select("-passwordHash");
  },
};
