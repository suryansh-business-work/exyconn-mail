import type { Request, Response } from 'express';
import Domain from '../modules/domain/domain.model';
import Mailbox from '../modules/mailbox/mailbox.model';
import User from '../modules/auth/user.model';
import mailService from '../modules/mail/mail.service';

export const getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [totalDomains, activeDomains, totalMailboxes, activeMailboxes, totalUsers, mailStats] =
      await Promise.all([
        Domain.countDocuments(),
        Domain.countDocuments({ status: 'active' }),
        Mailbox.countDocuments(),
        Mailbox.countDocuments({ status: 'active' }),
        User.countDocuments(),
        mailService.getStats(),
      ]);

    res.json({
      success: true,
      data: {
        stats: {
          domains: {
            total: totalDomains,
            active: activeDomains,
          },
          mailboxes: {
            total: totalMailboxes,
            active: activeMailboxes,
          },
          users: {
            total: totalUsers,
          },
          mail: mailStats,
        },
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch dashboard stats';
    res.status(500).json({ success: false, message });
  }
};
