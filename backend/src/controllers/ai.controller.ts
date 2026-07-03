import type { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as conversationService from "../services/conversation.service.js";
import * as openaiService from "../services/openai.service.js";
import * as telegramService from "../services/telegram.service.js";
import { AppError } from "../middleware/error.middleware.js";
const chatSchema = z.object({ message: z.string().min(1).max(4096) });
const planSchema = z.object({ text: z.string().min(1).max(5000) });
export const chat = asyncHandler(async (req: Request, res: Response) => {
  const body = chatSchema.parse(req.body);
  const chatId = await telegramService.resolveChatId();
  if (!chatId) throw new AppError("No Telegram chat ID configured. Send /start to the bot first.", 400);
  const conversation = await conversationService.findOrCreateConversation({ telegramChatId: chatId });
  await conversationService.saveMessage({
    conversationId: conversation._id,
    role: "user",
    content: body.message,
    source: "dashboard",
  });
  const context = await conversationService.getRecentContextMessages(conversation._id);
  const reply = await openaiService.generateChatReply(context);
  await conversationService.saveMessage({
    conversationId: conversation._id,
    role: "assistant",
    content: reply,
    source: "dashboard",
  });
  res.json({ success: true, data: { reply } });
});
export const plan = asyncHandler(async (req: Request, res: Response) => {
  const body = planSchema.parse(req.body);
  const tasks = await openaiService.generatePlan(body.text);
  res.json({ success: true, data: { tasks } });
});
