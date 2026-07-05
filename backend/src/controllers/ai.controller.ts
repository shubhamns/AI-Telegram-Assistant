import type { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as conversationService from "../services/conversation.service.js";
import * as openaiService from "../services/openai.service.js";
import * as workspaceService from "../services/workspace.service.js";
import { AppError } from "../middleware/error.middleware.js";
const chatSchema = z.object({ message: z.string().min(1).max(4096) });
const planSchema = z.object({ text: z.string().min(1).max(5000) });
export const chat = asyncHandler(async (req: Request, res: Response) => {
  const body = chatSchema.parse(req.body);
  const workspace = req.workspace!;
  const chatId = await workspaceService.resolveWorkspaceChatId(workspace);
  if (!chatId) throw new AppError("Link Telegram first in Settings.", 400);
  const conversation = await conversationService.findOrCreateConversation({
    workspaceId: workspace._id,
    telegramChatId: chatId,
  });
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
  await workspaceService.incrementUsage(workspace._id.toString(), "aiMessages");
  res.json({ success: true, data: { reply } });
});
export const plan = asyncHandler(async (req: Request, res: Response) => {
  const body = planSchema.parse(req.body);
  const tasks = await openaiService.generatePlan(body.text);
  await workspaceService.incrementUsage(req.workspace!._id.toString(), "brainDumps");
  res.json({ success: true, data: { tasks } });
});
