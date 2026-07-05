import express, { Router, type Request, type Response, type NextFunction } from "express";
import { env } from "../config/env.js";
import * as webhookController from "../controllers/webhook.controller.js";
import { AppError } from "../middleware/error.middleware.js";
const router = Router();
function validateWebhookSecret(req: Request, _res: Response, next: NextFunction): void {
  const token = req.headers["x-telegram-bot-api-secret-token"];
  if (token !== env.TELEGRAM_WEBHOOK_SECRET) throw new AppError("Invalid webhook secret", 401);
  next();
}
router.post("/stripe", express.raw({ type: "application/json" }), webhookController.stripe);
router.post("/telegram", express.json(), validateWebhookSecret, webhookController.telegram);
export default router;
