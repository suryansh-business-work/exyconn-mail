import { Request, Response } from "express";
import { mailboxesService } from "./mailboxes.services";
import {
  createMailboxSchema,
  updateMailboxSchema,
  queryMailboxesSchema,
  authenticateMailboxSchema,
} from "./mailboxes.validators";

export const mailboxesController = {
  async create(req: Request, res: Response) {
    try {
      const data = createMailboxSchema.parse(req.body);
      const mailbox = await mailboxesService.create(data);
      res.status(201).json({ success: true, data: mailbox });
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "ZodError") {
          res.status(400).json({ success: false, error: error.message });
          return;
        }
        if (error.message === "Domain not found") {
          res.status(404).json({ success: false, error: error.message });
          return;
        }
      }
      res
        .status(500)
        .json({ success: false, error: "Failed to create mailbox" });
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      const query = queryMailboxesSchema.parse(req.query);
      const result = await mailboxesService.getAll(query);
      res.json({ success: true, ...result });
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        res.status(400).json({ success: false, error: error.message });
        return;
      }
      res
        .status(500)
        .json({ success: false, error: "Failed to fetch mailboxes" });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const mailbox = await mailboxesService.getById(id);
      if (!mailbox) {
        res.status(404).json({ success: false, error: "Mailbox not found" });
        return;
      }
      res.json({ success: true, data: mailbox });
    } catch {
      res
        .status(500)
        .json({ success: false, error: "Failed to fetch mailbox" });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const data = updateMailboxSchema.parse(req.body);
      const mailbox = await mailboxesService.update(id, data);
      if (!mailbox) {
        res.status(404).json({ success: false, error: "Mailbox not found" });
        return;
      }
      res.json({ success: true, data: mailbox });
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        res.status(400).json({ success: false, error: error.message });
        return;
      }
      res
        .status(500)
        .json({ success: false, error: "Failed to update mailbox" });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const mailbox = await mailboxesService.delete(id);
      if (!mailbox) {
        res.status(404).json({ success: false, error: "Mailbox not found" });
        return;
      }
      res.json({ success: true, message: "Mailbox deleted successfully" });
    } catch {
      res
        .status(500)
        .json({ success: false, error: "Failed to delete mailbox" });
    }
  },

  async authenticate(req: Request, res: Response) {
    try {
      const { email, password } = authenticateMailboxSchema.parse(req.body);
      const mailbox = await mailboxesService.authenticate(email, password);
      if (!mailbox) {
        res.status(401).json({ success: false, error: "Invalid credentials" });
        return;
      }
      res.json({
        success: true,
        data: { email: mailbox.email, displayName: mailbox.displayName },
      });
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        res.status(400).json({ success: false, error: error.message });
        return;
      }
      res.status(500).json({ success: false, error: "Authentication failed" });
    }
  },
};
