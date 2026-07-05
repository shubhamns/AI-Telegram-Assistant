import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../middleware/error.middleware.js";
import * as billingService from "../services/billing.service.js";
import { handleTelegramUpdate } from "../webhooks/telegram.webhook.js";
export const stripe = asyncHandler(async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"];
  if (!signature || typeof signature !== "string") throw new AppError("Missing stripe signature", 400);
  await billingService.handleStripeWebhook(req.body as Buffer, signature);
  res.json({ received: true });
});
export const telegram = asyncHandler(async (req: Request, res: Response) => {
  await handleTelegramUpdate(req.body);
  res.json({ success: true });
});
