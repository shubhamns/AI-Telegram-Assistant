import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as conversationService from "../services/conversation.service.js";
import { AppError } from "../middleware/error.middleware.js";
export const listConversations = asyncHandler(async (req: Request, res: Response) => {
  const conversations = await conversationService.listConversations(req.workspace!._id.toString());
  res.json({ success: true, data: conversations });
});
export const getConversation = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const conversation = await conversationService.getConversationById(req.workspace!._id.toString(), id);
  if (!conversation) throw new AppError("Conversation not found", 404);
  res.json({ success: true, data: conversation });
});
export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const conversation = await conversationService.getConversationById(req.workspace!._id.toString(), id);
  if (!conversation) throw new AppError("Conversation not found", 404);
  const messages = await conversationService.getMessagesByConversationId(req.workspace!._id.toString(), id);
  res.json({ success: true, data: messages });
});
export const clearMessages = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const deleted = await conversationService.clearConversationMessages(req.workspace!._id.toString(), id);
  if (deleted === null) throw new AppError("Conversation not found", 404);
  res.json({ success: true, data: { deleted } });
});
