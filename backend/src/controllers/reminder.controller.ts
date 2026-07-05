import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as reminderService from "../services/reminder.service.js";
import * as workspaceService from "../services/workspace.service.js";
import { AppError } from "../middleware/error.middleware.js";
import { createReminderSchema, updateReminderSchema, reminderQuerySchema, clearCompletedSchema } from "../schemas/reminder.schema.js";
export const listReminders = asyncHandler(async (req: Request, res: Response) => {
  const query = reminderQuerySchema.parse(req.query);
  const workspaceId = req.workspace!._id.toString();
  const reminders = await reminderService.listReminders(workspaceId, query.status);
  res.json({ success: true, data: reminders });
});
export const createReminder = asyncHandler(async (req: Request, res: Response) => {
  const body = createReminderSchema.parse(req.body);
  const workspace = req.workspace!;
  const chatId = body.telegramChatId || await workspaceService.resolveWorkspaceChatId(workspace);
  if (!chatId) throw new AppError("Link Telegram first in Settings.", 400);
  const reminder = await reminderService.createReminder({
    workspaceId: workspace._id,
    title: body.title,
    scheduledAt: new Date(body.scheduledAt),
    telegramChatId: chatId,
    originalText: body.originalText,
    notifyMinutesBefore: body.notifyMinutesBefore,
    notifyMessageCount: body.notifyMessageCount,
    timezone: workspace.timezone,
  });
  await workspaceService.incrementUsage(workspace._id.toString(), "reminders");
  res.status(201).json({ success: true, data: reminder });
});
export const updateReminder = asyncHandler(async (req: Request, res: Response) => {
  const body = updateReminderSchema.parse(req.body);
  const id = String(req.params.id);
  const workspaceId = req.workspace!._id.toString();
  const reminder = await reminderService.updateReminder(workspaceId, id, {
    title: body.title,
    scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
    originalText: body.originalText,
    notifyMinutesBefore: body.notifyMinutesBefore,
    notifyMessageCount: body.notifyMessageCount,
  });
  if (!reminder) throw new AppError("Pending reminder not found", 404);
  res.json({ success: true, data: reminder });
});
export const deleteReminder = asyncHandler(async (req: Request, res: Response) => {
  const deleted = await reminderService.deleteReminder(req.workspace!._id.toString(), String(req.params.id));
  if (!deleted) throw new AppError("Pending reminder not found", 404);
  res.json({ success: true, data: { deleted: true } });
});
export const cancelReminder = asyncHandler(async (req: Request, res: Response) => {
  const reminder = await reminderService.cancelReminder(req.workspace!._id.toString(), String(req.params.id));
  if (!reminder) throw new AppError("Pending reminder not found", 404);
  res.json({ success: true, data: reminder });
});
export const completeReminder = asyncHandler(async (req: Request, res: Response) => {
  const reminder = await reminderService.completeReminder(req.workspace!._id.toString(), String(req.params.id));
  if (!reminder) throw new AppError("Pending reminder not found", 404);
  res.json({ success: true, data: reminder });
});
export const clearCompleted = asyncHandler(async (req: Request, res: Response) => {
  const body = clearCompletedSchema.parse(req.body);
  const deleted = await reminderService.clearCompletedReminders(req.workspace!._id.toString(), body.ids);
  res.json({ success: true, data: { deleted } });
});
