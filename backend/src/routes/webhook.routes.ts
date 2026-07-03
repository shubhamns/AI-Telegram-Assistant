import { Router, type Request, type Response, type NextFunction } from "express";
import { env } from "../config/env.js";
import { handleTelegramUpdate } from "../webhooks/telegram.webhook.js";
import { AppError } from "../middleware/error.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
const router = Router();
function validateWebhookSecret(req: Request, _res: Response, next: NextFunction): void {
  const token = req.headers["x-telegram-bot-api-secret-token"];
  if (token !== env.TELEGRAM_WEBHOOK_SECRET) {
    throw new AppError("Invalid webhook secret", 401);
  }
  next();
}
router.post("/telegram", validateWebhookSecret, asyncHandler(async (req: Request, res: Response) => {
  await handleTelegramUpdate(req.body);
  res.json({ success: true });
}));
export default router;
