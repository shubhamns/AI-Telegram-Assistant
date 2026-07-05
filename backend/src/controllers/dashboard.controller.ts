import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as dashboardService from "../services/dashboard.service.js";
export const getStats = asyncHandler(async (req: Request, res: Response) => {
  const data = await dashboardService.getDashboardStats(req.workspace!._id.toString());
  res.json({ success: true, data });
});
