import { Request, Response } from 'express';
import { domainsService } from './domains.services';
import {
  createDomainSchema,
  updateDomainSchema,
  queryDomainsSchema,
  generateDKIMSchema,
} from './domains.validators';

export const domainsController = {
  async create(req: Request, res: Response) {
    try {
      const data = createDomainSchema.parse(req.body);
      const domain = await domainsService.create(data);
      res.status(201).json({ success: true, data: domain });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({ success: false, error: error.message });
        return;
      }
      res.status(500).json({ success: false, error: 'Failed to create domain' });
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      const query = queryDomainsSchema.parse(req.query);
      const result = await domainsService.getAll(query);
      res.json({ success: true, ...result });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({ success: false, error: error.message });
        return;
      }
      res.status(500).json({ success: false, error: 'Failed to fetch domains' });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const domain = await domainsService.getById(id);
      if (!domain) {
        res.status(404).json({ success: false, error: 'Domain not found' });
        return;
      }
      res.json({ success: true, data: domain });
    } catch {
      res.status(500).json({ success: false, error: 'Failed to fetch domain' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const data = updateDomainSchema.parse(req.body);
      const domain = await domainsService.update(id, data);
      if (!domain) {
        res.status(404).json({ success: false, error: 'Domain not found' });
        return;
      }
      res.json({ success: true, data: domain });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({ success: false, error: error.message });
        return;
      }
      res.status(500).json({ success: false, error: 'Failed to update domain' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const domain = await domainsService.delete(id);
      if (!domain) {
        res.status(404).json({ success: false, error: 'Domain not found' });
        return;
      }
      res.json({ success: true, message: 'Domain deleted successfully' });
    } catch {
      res.status(500).json({ success: false, error: 'Failed to delete domain' });
    }
  },

  async generateDKIM(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { selector } = generateDKIMSchema.parse(req.body);
      const domain = await domainsService.generateDKIM(id, selector);
      if (!domain) {
        res.status(404).json({ success: false, error: 'Domain not found' });
        return;
      }
      res.json({ success: true, data: domain });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({ success: false, error: error.message });
        return;
      }
      res.status(500).json({ success: false, error: 'Failed to generate DKIM' });
    }
  },

  async verify(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const result = await domainsService.verifyDomain(id);
      res.json({ success: true, ...result });
    } catch {
      res.status(500).json({ success: false, error: 'Failed to verify domain' });
    }
  },

  async getDNSRecords(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const result = await domainsService.getDNSRecords(id);
      if (!result) {
        res.status(404).json({ success: false, error: 'Domain not found' });
        return;
      }
      res.json({ success: true, ...result });
    } catch {
      res.status(500).json({ success: false, error: 'Failed to get DNS records' });
    }
  },
};
