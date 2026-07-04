import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as conversationService from "../services/conversation.service.js";
import { AppError } from "../middleware/error.middleware.js";
export const listConversations = asyncHandler(async (_req: Request, res: Response) => {
  const conversations = await conversationService.listConversations();
  res.json({ success: true, data: conversations });
});
export const getConversation = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const conversation = await conversationService.getConversationById(id);
  if (!conversation) throw new AppError("Conversation not found", 404);
  res.json({ success: true, data: conversation });
});
export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const conversation = await conversationService.getConversationById(id);
  if (!conversation) throw new AppError("Conversation not found", 404);
  const messages = await conversationService.getMessagesByConversationId(id);
  res.json({ success: true, data: messages });
});
export const clearMessages = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const deleted = await conversationService.clearConversationMessages(id);
  if (deleted === null) throw new AppError("Conversation not found", 404);
  res.json({ success: true, data: { deleted } });
});
