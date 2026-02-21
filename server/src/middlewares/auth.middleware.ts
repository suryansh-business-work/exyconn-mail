import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config/index";
import { TokenPayload } from "../modules/auth/auth.validators";

export interface AuthenticatedRequest extends Request {
  user: TokenPayload;
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res
        .status(401)
        .json({ success: false, message: "Access token required" });
      return;
    }

    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, config.jwtSecret) as TokenPayload;

    (req as AuthenticatedRequest).user = payload;
    next();
  } catch {
    res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      res
        .status(401)
        .json({ success: false, message: "Authentication required" });
      return;
    }

    if (!roles.includes(user.role)) {
      res
        .status(403)
        .json({ success: false, message: "Insufficient permissions" });
      return;
    }

    next();
  };
};
