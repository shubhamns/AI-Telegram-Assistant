import { z } from "zod";
export const createReminderSchema = z.object({
  title: z.string().min(1).max(500),
  scheduledAt: z.string().datetime({ offset: true }).or(z.string().datetime()),
  telegramChatId: z.string().optional(),
  originalText: z.string().optional(),
  notifyMinutesBefore: z.number().int().min(0).max(1440).optional(),
  notifyMessageCount: z.number().int().min(1).max(5).optional(),
});
export const updateReminderSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  scheduledAt: z.string().datetime({ offset: true }).or(z.string().datetime()).optional(),
  originalText: z.string().optional(),
  notifyMinutesBefore: z.number().int().min(0).max(1440).optional(),
  notifyMessageCount: z.number().int().min(1).max(5).optional(),
});
export const reminderQuerySchema = z.object({
  status: z.enum(["pending", "processing", "sent", "failed", "cancelled"]).optional(),
});
export const reminderIntentSchema = z.object({
  intent: z.enum(["create_reminder", "chat"]),
  title: z.string(),
  scheduledAt: z.string().nullable(),
  confidence: z.number().min(0).max(1),
});
export type ReminderIntent = z.infer<typeof reminderIntentSchema>;
export const clearCompletedSchema = z.object({
  ids: z.array(z.string()).optional(),
});
