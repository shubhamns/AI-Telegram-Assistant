import type { Request, Response, NextFunction } from "express";
import { AppError } from "./error.middleware.js";
import * as authService from "../services/auth.service.js";
import * as workspaceService from "../services/workspace.service.js";
import { User } from "../models/user.model.js";
export async function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) throw new AppError("Authentication required", 401);
    const { userId, workspaceId } = authService.verifyJwt(header.slice(7));
    const user = await User.findById(userId);
    const workspace = await workspaceService.getWorkspaceById(workspaceId);
    if (!user || !workspace || user.workspaceId.toString() !== workspaceId) throw new AppError("Invalid session", 401);
    req.user = user;
    req.workspace = workspace;
    next();
  } catch (err) {
    if (err instanceof AppError) return next(err);
    next(new AppError("Invalid or expired token", 401));
  }
}
export function requireVerifiedEmail(req: Request, _res: Response, next: NextFunction) {
  if (!req.user?.emailVerified) return next(new AppError("Please verify your email first", 403));
  next();
}
