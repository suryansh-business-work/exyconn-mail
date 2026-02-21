import dns from "dns";
import { promisify } from "util";
import Domain, { IDomain } from "./domain.model";
import config from "../../config/index";
import { CreateDomainDto, UpdateDomainDto } from "./domain.validators";

const resolveMx = promisify(dns.resolveMx);
const resolveTxt = promisify(dns.resolveTxt);

export class DomainService {
  async create(dto: CreateDomainDto, ownerId: string): Promise<IDomain> {
    const existing = await Domain.findOne({ name: dto.name.toLowerCase() });
    if (existing) {
      throw new Error("Domain already registered");
    }

    const domain = new Domain({
      name: dto.name.toLowerCase(),
      owner: ownerId,
      status: "dns-pending",
      dkimSelector: config.dkimSelector,
      dnsRecords: [
        {
          type: "MX",
          name: dto.name.toLowerCase(),
          value: `10 ${config.mailServerHostname}`,
          verified: false,
        },
        {
          type: "TXT",
          name: dto.name.toLowerCase(),
          value: "v=spf1 mx ~all",
          verified: false,
        },
        {
          type: "TXT",
          name: `_dmarc.${dto.name.toLowerCase()}`,
          value: "v=DMARC1; p=none; rua=mailto:dmarc@" + dto.name.toLowerCase(),
          verified: false,
        },
        {
          type: "TXT",
          name: `${config.dkimSelector}._domainkey.${dto.name.toLowerCase()}`,
          value: "v=DKIM1; k=rsa; p=<DKIM_PUBLIC_KEY_PLACEHOLDER>",
          verified: false,
        },
      ],
    });

    await domain.save();
    return domain;
  }

  async getAll(filters: {
    ownerId?: string;
    status?: string;
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<{
    domains: IDomain[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      ownerId,
      status,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = filters;

    const query: Record<string, unknown> = {};
    if (ownerId) query.owner = ownerId;
    if (status) query.status = status;
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const total = await Domain.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    const domains = await Domain.find(query)
      .populate("owner", "name email")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    return { domains, total, page, totalPages };
  }

  async getById(id: string): Promise<IDomain> {
    const domain = await Domain.findById(id).populate("owner", "name email");
    if (!domain) {
      throw new Error("Domain not found");
    }
    return domain;
  }

  async update(id: string, dto: UpdateDomainDto): Promise<IDomain> {
    const domain = await Domain.findByIdAndUpdate(id, dto, { new: true });
    if (!domain) {
      throw new Error("Domain not found");
    }
    return domain;
  }

  async delete(id: string): Promise<void> {
    const domain = await Domain.findByIdAndDelete(id);
    if (!domain) {
      throw new Error("Domain not found");
    }
  }

  async verifyDns(id: string): Promise<{
    mxVerified: boolean;
    spfVerified: boolean;
    dmarcVerified: boolean;
    domain: IDomain;
  }> {
    const domain = await Domain.findById(id);
    if (!domain) {
      throw new Error("Domain not found");
    }

    let mxVerified = false;
    let spfVerified = false;
    let dmarcVerified = false;

    // Verify MX
    try {
      const mxRecords = await resolveMx(domain.name);
      mxVerified = mxRecords.some(
        (mx) =>
          mx.exchange.toLowerCase() === config.mailServerHostname.toLowerCase(),
      );
    } catch {
      mxVerified = false;
    }

    // Verify SPF
    try {
      const txtRecords = await resolveTxt(domain.name);
      const flat = txtRecords.map((r) => r.join(""));
      spfVerified = flat.some((txt) => txt.includes("v=spf1"));
    } catch {
      spfVerified = false;
    }

    // Verify DMARC
    try {
      const dmarcRecords = await resolveTxt(`_dmarc.${domain.name}`);
      const flat = dmarcRecords.map((r) => r.join(""));
      dmarcVerified = flat.some((txt) => txt.includes("v=DMARC1"));
    } catch {
      dmarcVerified = false;
    }

    // Update domain
    domain.mxVerified = mxVerified;
    domain.spfVerified = spfVerified;
    domain.dmarcVerified = dmarcVerified;

    // Update individual dns records
    domain.dnsRecords.forEach((record) => {
      if (record.type === "MX") record.verified = mxVerified;
      if (record.type === "TXT" && record.name === domain.name)
        record.verified = spfVerified;
      if (record.type === "TXT" && record.name.startsWith("_dmarc."))
        record.verified = dmarcVerified;
      record.lastChecked = new Date();
    });

    if (mxVerified && spfVerified) {
      domain.status = "active";
    }

    await domain.save();

    return { mxVerified, spfVerified, dmarcVerified, domain };
  }

  async getDnsInstructions(id: string): Promise<{
    domain: string;
    records: Array<{
      type: string;
      name: string;
      value: string;
      verified: boolean;
    }>;
  }> {
    const domain = await Domain.findById(id);
    if (!domain) {
      throw new Error("Domain not found");
    }

    return {
      domain: domain.name,
      records: domain.dnsRecords.map((r) => ({
        type: r.type,
        name: r.name,
        value: r.value,
        verified: r.verified,
      })),
    };
  }
}

export default new DomainService();
