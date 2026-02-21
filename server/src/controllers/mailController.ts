import type { Request, Response } from 'express';

interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  createdAt: Date;
}

// In-memory storage for demo purposes
const emails: Email[] = [
  {
    id: '1',
    from: 'john@example.com',
    to: 'user@exyconn.com',
    subject: 'Meeting Tomorrow',
    body: 'Hi, just a reminder about our meeting tomorrow at 10 AM.',
    createdAt: new Date('2026-02-02'),
  },
  {
    id: '2',
    from: 'jane@example.com',
    to: 'user@exyconn.com',
    subject: 'Project Update',
    body: 'The project is on track. We completed the first milestone.',
    createdAt: new Date('2026-02-01'),
  },
];

export const sendEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { to, subject, body, from } = req.body;

    if (!to || !subject || !body) {
      res.status(400).json({ error: 'Missing required fields: to, subject, body' });
      return;
    }

    const newEmail: Email = {
      id: Date.now().toString(),
      from: from || 'noreply@exyconn.com',
      to,
      subject,
      body,
      createdAt: new Date(),
    };

    emails.push(newEmail);

    // TODO: Implement actual email sending with nodemailer
    res.status(201).json({ message: 'Email sent successfully', email: newEmail });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
};

export const getEmails = async (_req: Request, res: Response): Promise<void> => {
  try {
    res.json({ emails });
  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
};

export const getEmailById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const email = emails.find((e) => e.id === id);

    if (!email) {
      res.status(404).json({ error: 'Email not found' });
      return;
    }

    res.json({ email });
  } catch (error) {
    console.error('Error fetching email:', error);
    res.status(500).json({ error: 'Failed to fetch email' });
  }
};
