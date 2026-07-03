import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as telegramService from "../services/telegram.service.js";
import * as conversationService from "../services/conversation.service.js";
import * as automationService from "../services/automation.service.js";
import { AppError } from "../middleware/error.middleware.js";
import { sendMessageSchema, setWebhookSchema } from "../schemas/telegram.schema.js";
import { env } from "../config/env.js";
export const getStatus = asyncHandler(async (_req: Request, res: Response) => {
  const bot = await telegramService.getMe();
  const chatId = await telegramService.resolveChatId();
  const conversation = await conversationService.getLatestConversation();
  res.json({
    success: true,
    data: {
      connected: true,
      botUsername: bot.username,
      botName: bot.first_name,
      userDisplayName: conversation?.firstName || null,
      chatId: chatId ? `${chatId.slice(0, 3)}***${chatId.slice(-2)}` : null,
      mode: env.TELEGRAM_MODE,
    },
  });
});
export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const body = sendMessageSchema.parse(req.body);
  const chatId = await telegramService.resolveChatId();
  if (!chatId) throw new AppError("No Telegram chat ID configured. Send /start to the bot first.", 400);
  await telegramService.sendMessage(chatId, body.message);
  const conversation = await conversationService.findOrCreateConversation({ telegramChatId: chatId });
  await conversationService.saveMessage({
    conversationId: conversation._id,
    role: "assistant",
    content: body.message,
    source: "dashboard",
  });
  await automationService.logSuccess("dashboard_message", `Message sent from dashboard: ${body.message.slice(0, 50)}`);
  res.json({ success: true, data: { sent: true } });
});
export const setWebhook = asyncHandler(async (req: Request, res: Response) => {
  const body = setWebhookSchema.parse(req.body);
  const url = body.url || `${env.BACKEND_PUBLIC_URL}/api/v1/webhooks/telegram`;
  if (!url.startsWith("https://")) throw new AppError("Webhook URL must be HTTPS", 400);
  const result = await telegramService.setWebhook(url, env.TELEGRAM_WEBHOOK_SECRET);
  res.json({ success: true, data: result });
});
export const webhookInfo = asyncHandler(async (_req: Request, res: Response) => {
  const info = await telegramService.getWebhookInfo();
  res.json({ success: true, data: info });
});
