import crypto from 'crypto';
import dns from 'dns';
import { promisify } from 'util';
import { Domain, IDomain } from './domains.models';
import {
  CreateDomainInput,
  UpdateDomainInput,
  QueryDomainsInput,
} from './domains.validators';

const resolveMx = promisify(dns.resolveMx);
const resolveTxt = promisify(dns.resolveTxt);

export const domainsService = {
  async create(data: CreateDomainInput): Promise<IDomain> {
    const domain = new Domain(data);
    await domain.save();
    return domain;
  },

  async getAll(query: QueryDomainsInput) {
    const { page, limit, search, isActive, isVerified, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    if (typeof isActive === 'boolean') {
      filter.isActive = isActive;
    }
    if (typeof isVerified === 'boolean') {
      filter.isVerified = isVerified;
    }

    const sortOptions: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };

    const [domains, total] = await Promise.all([
      Domain.find(filter).sort(sortOptions).skip(skip).limit(limit),
      Domain.countDocuments(filter),
    ]);

    return {
      data: domains,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getById(id: string): Promise<IDomain | null> {
    return Domain.findById(id);
  },

  async getByName(name: string): Promise<IDomain | null> {
    return Domain.findOne({ name: name.toLowerCase() });
  },

  async update(id: string, data: UpdateDomainInput): Promise<IDomain | null> {
    return Domain.findByIdAndUpdate(id, data, { new: true });
  },

  async delete(id: string): Promise<IDomain | null> {
    return Domain.findByIdAndDelete(id);
  },

  async generateDKIM(id: string, selector: string = 'mail'): Promise<IDomain | null> {
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });

    const publicKeyBase64 = publicKey
      .replace(/-----BEGIN PUBLIC KEY-----/g, '')
      .replace(/-----END PUBLIC KEY-----/g, '')
      .replace(/\n/g, '');

    return Domain.findByIdAndUpdate(
      id,
      {
        dkim: {
          selector,
          privateKey,
          publicKey: publicKeyBase64,
        },
      },
      { new: true }
    );
  },

  async verifyDomain(id: string): Promise<{ verified: boolean; errors: string[] }> {
    const domain = await Domain.findById(id);
    if (!domain) {
      return { verified: false, errors: ['Domain not found'] };
    }

    const errors: string[] = [];

    // Verify MX record
    try {
      const mxRecords = await resolveMx(domain.name);
      const hasMx = mxRecords.some(
        (mx) => mx.exchange.toLowerCase() === domain.mxHost.toLowerCase()
      );
      if (!hasMx) {
        errors.push(`MX record not found. Expected: ${domain.mxHost}`);
      }
    } catch {
      errors.push('Failed to resolve MX records');
    }

    // Verify SPF record
    if (domain.spfRecord) {
      try {
        const txtRecords = await resolveTxt(domain.name);
        const flatRecords = txtRecords.map((r) => r.join(''));
        const hasSpf = flatRecords.some((r) => r.includes('v=spf1'));
        if (!hasSpf) {
          errors.push('SPF record not found');
        }
      } catch {
        errors.push('Failed to resolve TXT records for SPF');
      }
    }

    // Verify DKIM record
    if (domain.dkim) {
      try {
        const dkimHost = `${domain.dkim.selector}._domainkey.${domain.name}`;
        const txtRecords = await resolveTxt(dkimHost);
        const flatRecords = txtRecords.map((r) => r.join(''));
        const hasDkim = flatRecords.some((r) => r.includes('v=DKIM1'));
        if (!hasDkim) {
          errors.push(`DKIM record not found at ${dkimHost}`);
        }
      } catch {
        errors.push('Failed to resolve DKIM record');
      }
    }

    const verified = errors.length === 0;
    await Domain.findByIdAndUpdate(id, { isVerified: verified });

    return { verified, errors };
  },

  async getDNSRecords(id: string) {
    const domain = await Domain.findById(id);
    if (!domain) return null;

    const records = [
      {
        type: 'MX',
        host: domain.name,
        value: domain.mxHost,
        priority: domain.mxPriority,
        description: 'Mail exchange record - directs email to your mail server',
      },
      {
        type: 'TXT',
        host: domain.name,
        value: domain.spfRecord || `v=spf1 mx a ip4:<YOUR_SERVER_IP> -all`,
        description: 'SPF record - prevents email spoofing',
      },
    ];

    if (domain.dkim) {
      records.push({
        type: 'TXT',
        host: `${domain.dkim.selector}._domainkey.${domain.name}`,
        value: `v=DKIM1; k=rsa; p=${domain.dkim.publicKey}`,
        priority: 0,
        description: 'DKIM record - email authentication',
      });
    }

    records.push({
      type: 'TXT',
      host: `_dmarc.${domain.name}`,
      value: domain.dmarcRecord || `v=DMARC1; p=quarantine; rua=mailto:dmarc@${domain.name}`,
      priority: 0,
      description: 'DMARC record - email policy enforcement',
    });

    return { domain, records };
  },
};
