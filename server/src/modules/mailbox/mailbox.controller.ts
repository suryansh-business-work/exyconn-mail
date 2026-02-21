import type { Request, Response } from 'express';
import mailboxService from './mailbox.service';
import { validateCreateMailboxDto, validateUpdateMailboxDto } from './mailbox.validators';

interface AuthRequest extends Request {
  user: { userId: string; role: string };
}

export const createMailbox = async (req: Request, res: Response): Promise<void> => {
  try {
    const validation = validateCreateMailboxDto(req.body);
    if (!validation.valid) {
      res.status(400).json({ success: false, errors: validation.errors });
      return;
    }

    const authReq = req as AuthRequest;
    const mailbox = await mailboxService.create(req.body, authReq.user.userId);
    res.status(201).json({ success: true, data: { mailbox } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create mailbox';
    const status = message.includes('already exists')
      ? 409
      : message.includes('not found')
        ? 404
        : 500;
    res.status(status).json({ success: false, message });
  }
};

export const getMailboxes = async (req: Request, res: Response): Promise<void> => {
  try {
    const filters = {
      page: parseInt(String(req.query.page)) || 1,
      limit: parseInt(String(req.query.limit)) || 10,
      search: req.query.search ? String(req.query.search) : undefined,
      sortBy: req.query.sortBy ? String(req.query.sortBy) : 'createdAt',
      sortOrder: (req.query.sortOrder ? String(req.query.sortOrder) : 'desc') as 'asc' | 'desc',
      status: req.query.status ? String(req.query.status) : undefined,
      domainId: req.query.domainId ? String(req.query.domainId) : undefined,
      domainName: req.query.domainName ? String(req.query.domainName) : undefined,
    };

    const result = await mailboxService.getAll(filters);
    res.json({ success: true, data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch mailboxes';
    res.status(500).json({ success: false, message });
  }
};

export const getMailboxById = async (req: Request, res: Response): Promise<void> => {
  try {
    const mailbox = await mailboxService.getById(String(req.params.id));
    res.json({ success: true, data: { mailbox } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch mailbox';
    res.status(404).json({ success: false, message });
  }
};

export const updateMailbox = async (req: Request, res: Response): Promise<void> => {
  try {
    const validation = validateUpdateMailboxDto(req.body);
    if (!validation.valid) {
      res.status(400).json({ success: false, errors: validation.errors });
      return;
    }

    const mailbox = await mailboxService.update(String(req.params.id), req.body);
    res.json({ success: true, data: { mailbox } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update mailbox';
    res.status(404).json({ success: false, message });
  }
};

export const suspendMailbox = async (req: Request, res: Response): Promise<void> => {
  try {
    const mailbox = await mailboxService.suspend(String(req.params.id));
    res.json({
      success: true,
      data: { mailbox },
      message: 'Mailbox suspended',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to suspend mailbox';
    res.status(404).json({ success: false, message });
  }
};

export const activateMailbox = async (req: Request, res: Response): Promise<void> => {
  try {
    const mailbox = await mailboxService.activate(String(req.params.id));
    res.json({
      success: true,
      data: { mailbox },
      message: 'Mailbox activated',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to activate mailbox';
    res.status(404).json({ success: false, message });
  }
};

export const deleteMailbox = async (req: Request, res: Response): Promise<void> => {
  try {
    await mailboxService.delete(String(req.params.id));
    res.json({ success: true, message: 'Mailbox deleted successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete mailbox';
    res.status(404).json({ success: false, message });
  }
};

export const changeMailboxPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { password } = req.body;
    if (!password || typeof password !== 'string' || password.length < 8) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters',
      });
      return;
    }

    await mailboxService.changePassword(String(req.params.id), password);
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to change password';
    res.status(404).json({ success: false, message });
  }
};
