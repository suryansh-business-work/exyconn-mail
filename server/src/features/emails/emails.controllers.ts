import { Request, Response } from "express";
import { emailsService } from "./emails.services";
import {
  sendEmailSchema,
  emailIdSchema,
  emailQuerySchema,
  updateEmailSchema,
  replyEmailSchema,
} from "./emails.validators";
import { ZodError } from "zod";

const handleZodError = (error: ZodError, res: Response): void => {
  res.status(400).json({
    success: false,
    message: "Validation error",
    errors: error.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    })),
  });
};

export const emailsController = {
  async send(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = sendEmailSchema.parse(req.body);
      const email = await emailsService.sendEmail(validatedData);
      res.status(201).json({
        success: true,
        message: "Email sent successfully",
        data: email,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        handleZodError(error, res);
        return;
      }
      res.status(500).json({
        success: false,
        message: "Failed to send email",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const query = emailQuerySchema.parse(req.query);
      const result = await emailsService.getAll(query);
      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        handleZodError(error, res);
        return;
      }
      res.status(500).json({
        success: false,
        message: "Failed to fetch emails",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = emailIdSchema.parse(req.params);
      const email = await emailsService.getById(id);
      if (!email) {
        res.status(404).json({
          success: false,
          message: "Email not found",
        });
        return;
      }
      await emailsService.markAsRead(id);
      res.json({
        success: true,
        data: email,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        handleZodError(error, res);
        return;
      }
      res.status(500).json({
        success: false,
        message: "Failed to fetch email",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = emailIdSchema.parse(req.params);
      const validatedData = updateEmailSchema.parse(req.body);
      const email = await emailsService.update(id, validatedData);
      if (!email) {
        res.status(404).json({
          success: false,
          message: "Email not found",
        });
        return;
      }
      res.json({
        success: true,
        message: "Email updated successfully",
        data: email,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        handleZodError(error, res);
        return;
      }
      res.status(500).json({
        success: false,
        message: "Failed to update email",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = emailIdSchema.parse(req.params);
      const email = await emailsService.delete(id);
      if (!email) {
        res.status(404).json({
          success: false,
          message: "Email not found",
        });
        return;
      }
      res.json({
        success: true,
        message: "Email deleted successfully",
      });
    } catch (error) {
      if (error instanceof ZodError) {
        handleZodError(error, res);
        return;
      }
      res.status(500).json({
        success: false,
        message: "Failed to delete email",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async moveToTrash(req: Request, res: Response): Promise<void> {
    try {
      const { id } = emailIdSchema.parse(req.params);
      const email = await emailsService.moveToTrash(id);
      if (!email) {
        res.status(404).json({
          success: false,
          message: "Email not found",
        });
        return;
      }
      res.json({
        success: true,
        message: "Email moved to trash",
        data: email,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        handleZodError(error, res);
        return;
      }
      res.status(500).json({
        success: false,
        message: "Failed to move email to trash",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async toggleStar(req: Request, res: Response): Promise<void> {
    try {
      const { id } = emailIdSchema.parse(req.params);
      const email = await emailsService.toggleStar(id);
      if (!email) {
        res.status(404).json({
          success: false,
          message: "Email not found",
        });
        return;
      }
      res.json({
        success: true,
        message: email.isStarred ? "Email starred" : "Email unstarred",
        data: email,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        handleZodError(error, res);
        return;
      }
      res.status(500).json({
        success: false,
        message: "Failed to toggle star",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async reply(req: Request, res: Response): Promise<void> {
    try {
      const { id } = emailIdSchema.parse(req.params);
      const replyData = replyEmailSchema.parse(req.body);
      const originalEmail = await emailsService.getById(id);

      if (!originalEmail) {
        res.status(404).json({
          success: false,
          message: "Original email not found",
        });
        return;
      }

      const replySubject = originalEmail.subject.startsWith("Re:")
        ? originalEmail.subject
        : `Re: ${originalEmail.subject}`;

      const mailboxId = originalEmail.mailboxId.toString();

      const sendInput = {
        mailboxId,
        from: originalEmail.to[0] || "noreply@exyconn.com",
        to: [originalEmail.from],
        cc: [] as string[],
        bcc: [] as string[],
        subject: replySubject,
        textBody: replyData.textBody,
        htmlBody: replyData.htmlBody,
      };

      const email = await emailsService.sendEmail(sendInput);

      res.status(201).json({
        success: true,
        message: "Reply sent successfully",
        data: email,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        handleZodError(error, res);
        return;
      }
      res.status(500).json({
        success: false,
        message: "Failed to send reply",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
};
