import type { Request, Response, NextFunction } from "express";
import { AppError } from "./error.middleware.js";
import * as workspaceService from "../services/workspace.service.js";
export function requireUsage(field: "aiMessages" | "reminders" | "brainDumps") {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.workspace) throw new AppError("Workspace required", 401);
      await workspaceService.checkUsage(req.workspace, field);
      next();
    } catch (err) {
      next(err instanceof AppError ? err : new AppError(err instanceof Error ? err.message : "Usage limit reached", 402));
    }
  };
}
