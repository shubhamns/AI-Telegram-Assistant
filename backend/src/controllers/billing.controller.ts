import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../middleware/error.middleware.js";
import * as billingService from "../services/billing.service.js";
import * as workspaceService from "../services/workspace.service.js";
export const getPlans = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: { plans: billingService.getPlans(), enabled: billingService.isBillingEnabled() } });
});
export const getUsage = asyncHandler(async (req: Request, res: Response) => {
  const workspace = await workspaceService.resetUsageIfNeeded(req.workspace!);
  res.json({ success: true, data: workspaceService.serializeWorkspace(workspace) });
});
export const checkout = asyncHandler(async (req: Request, res: Response) => {
  try {
    const data = await billingService.createCheckoutSession(req.workspace!._id.toString(), req.user!.email);
    res.json({ success: true, data });
  } catch (err) {
    throw new AppError(err instanceof Error ? err.message : "Checkout failed", 400);
  }
});
export const portal = asyncHandler(async (req: Request, res: Response) => {
  try {
    const data = await billingService.createPortalSession(req.workspace!._id.toString());
    res.json({ success: true, data });
  } catch (err) {
    throw new AppError(err instanceof Error ? err.message : "Portal failed", 400);
  }
});
