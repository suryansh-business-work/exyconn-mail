import type { Request, Response } from "express";
import domainService from "./domain.service";
import {
  validateCreateDomainDto,
  validateUpdateDomainDto,
} from "./domain.validators";

interface AuthRequest extends Request {
  user: { userId: string; role: string };
}

export const createDomain = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const validation = validateCreateDomainDto(req.body);
    if (!validation.valid) {
      res.status(400).json({ success: false, errors: validation.errors });
      return;
    }

    const authReq = req as AuthRequest;
    const domain = await domainService.create(req.body, authReq.user.userId);
    res.status(201).json({ success: true, data: { domain } });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create domain";
    const status = message.includes("already registered") ? 409 : 500;
    res.status(status).json({ success: false, message });
  }
};

export const getDomains = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const filters: Record<string, unknown> = {
      page: parseInt(String(req.query.page)) || 1,
      limit: parseInt(String(req.query.limit)) || 10,
      search: req.query.search ? String(req.query.search) : undefined,
      sortBy: req.query.sortBy ? String(req.query.sortBy) : "createdAt",
      sortOrder: req.query.sortOrder ? String(req.query.sortOrder) : "desc",
      status: req.query.status ? String(req.query.status) : undefined,
    };

    // Non-admin users can only see their own domains
    if (authReq.user.role !== "admin") {
      filters.ownerId = authReq.user.userId;
    }

    const result = await domainService.getAll(
      filters as Parameters<typeof domainService.getAll>[0],
    );
    res.json({ success: true, data: result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch domains";
    res.status(500).json({ success: false, message });
  }
};

export const getDomainById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const domain = await domainService.getById(String(req.params.id));
    res.json({ success: true, data: { domain } });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch domain";
    res.status(404).json({ success: false, message });
  }
};

export const updateDomain = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const validation = validateUpdateDomainDto(req.body);
    if (!validation.valid) {
      res.status(400).json({ success: false, errors: validation.errors });
      return;
    }

    const domain = await domainService.update(String(req.params.id), req.body);
    res.json({ success: true, data: { domain } });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update domain";
    res.status(404).json({ success: false, message });
  }
};

export const deleteDomain = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    await domainService.delete(String(req.params.id));
    res.json({ success: true, message: "Domain deleted successfully" });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete domain";
    res.status(404).json({ success: false, message });
  }
};

export const verifyDomainDns = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const result = await domainService.verifyDns(String(req.params.id));
    res.json({ success: true, data: result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "DNS verification failed";
    res.status(404).json({ success: false, message });
  }
};

export const getDnsInstructions = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const result = await domainService.getDnsInstructions(
      String(req.params.id),
    );
    res.json({ success: true, data: result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to get DNS instructions";
    res.status(404).json({ success: false, message });
  }
};
