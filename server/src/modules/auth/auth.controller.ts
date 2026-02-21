import type { Request, Response } from "express";
import authService from "./auth.service";
import { validateRegisterDto, validateLoginDto } from "./auth.validators";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const validation = validateRegisterDto(req.body);
    if (!validation.valid) {
      res.status(400).json({ success: false, errors: validation.errors });
      return;
    }

    const result = await authService.register(req.body);
    res.status(201).json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Registration failed";
    const status = message.includes("already exists") ? 409 : 500;
    res.status(status).json({ success: false, message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const validation = validateLoginDto(req.body);
    if (!validation.valid) {
      res.status(400).json({ success: false, errors: validation.errors });
      return;
    }

    const result = await authService.login(req.body);
    res.json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed";
    const status = message.includes("Invalid")
      ? 401
      : message.includes("deactivated")
        ? 403
        : 500;
    res.status(status).json({ success: false, message });
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      res
        .status(400)
        .json({ success: false, message: "Refresh token is required" });
      return;
    }

    const result = await authService.refreshToken(token);
    res.json({ success: true, data: result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Token refresh failed";
    res.status(401).json({ success: false, message });
  }
};

export const getProfile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req as Request & { user: { userId: string } }).user.userId;
    const user = await authService.getProfile(userId);
    res.json({ success: true, data: { user } });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to get profile";
    res.status(404).json({ success: false, message });
  }
};

export const updateUserRole = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["admin", "domain-owner", "user"].includes(role)) {
      res.status(400).json({ success: false, message: "Invalid role" });
      return;
    }

    const user = await authService.updateRole(id as string, role);
    res.json({ success: true, data: { user } });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update role";
    res.status(404).json({ success: false, message });
  }
};
