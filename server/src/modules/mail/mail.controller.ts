import type { Request, Response } from 'express';
import mailService from './mail.service';
import { validateMailEventDto } from './mail.validators';

export const handleMailEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const validation = validateMailEventDto(req.body);
    if (!validation.valid) {
      res.status(400).json({ success: false, errors: validation.errors });
      return;
    }

    const log = await mailService.logMailEvent(req.body);
    res.status(201).json({ success: true, data: { log } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to log mail event';
    res.status(500).json({ success: false, message });
  }
};

export const getMailLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const filters = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
      search: req.query.search as string,
      sortBy: (req.query.sortBy as string) || 'createdAt',
      sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
      direction: req.query.direction as string,
      status: req.query.status as string,
      domainId: req.query.domainId as string,
      mailboxId: req.query.mailboxId as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
    };

    const result = await mailService.getLogs(filters);
    res.json({ success: true, data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch mail logs';
    res.status(500).json({ success: false, message });
  }
};

export const getMailLogById = async (req: Request, res: Response): Promise<void> => {
  try {
    const log = await mailService.getLogById(String(req.params.id));
    res.json({ success: true, data: { log } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch mail log';
    res.status(404).json({ success: false, message });
  }
};

export const getMailStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const domainId = req.query.domainId as string | undefined;
    const stats = await mailService.getStats(domainId);
    res.json({ success: true, data: { stats } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch mail stats';
    res.status(500).json({ success: false, message });
  }
};
