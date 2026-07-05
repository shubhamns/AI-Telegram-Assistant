import { Types } from "mongoose";
import { Reminder, type IReminder } from "../models/reminder.model.js";
import { env } from "../config/env.js";
import { formatInTimeZone } from "date-fns-tz";
import * as telegramService from "./telegram.service.js";
import * as automationService from "./automation.service.js";
import { logger } from "../utils/logger.js";
function reminderBody(title: string, notes?: string): string {
  const titleText = title.trim();
  const noteText = notes?.trim();
  if (!noteText || noteText === titleText) return titleText;
  return `${titleText}\n\n${noteText}`;
}
function reminderMessageText(title: string, notes?: string, index?: number, total?: number): string {
  const base = `Reminder: ${reminderBody(title, notes)}`;
  if (total && total > 1 && index) return `${base} (${index}/${total})`;
  return base;
}
export async function createReminder(data: {
  workspaceId: Types.ObjectId;
  title: string;
  scheduledAt: Date;
  telegramChatId: string;
  originalText?: string;
  notifyMinutesBefore?: number;
  notifyMessageCount?: number;
  timezone?: string;
}): Promise<IReminder> {
  return Reminder.create({
    workspaceId: data.workspaceId,
    title: data.title,
    scheduledAt: data.scheduledAt,
    telegramChatId: data.telegramChatId,
    originalText: data.originalText,
    notifyMinutesBefore: data.notifyMinutesBefore ?? 0,
    notifyMessageCount: data.notifyMessageCount ?? 1,
    notifySent: false,
    timezone: data.timezone || env.APP_TIMEZONE,
    status: "pending",
  });
}
export async function listReminders(workspaceId: string, status?: string): Promise<IReminder[]> {
  const filter: { workspaceId: string; status?: string } = { workspaceId };
  if (status) filter.status = status;
  return Reminder.find(filter).sort({ scheduledAt: 1 });
}
export async function updateReminder(workspaceId: string, id: string, data: {
  title?: string;
  scheduledAt?: Date;
  originalText?: string;
  notifyMinutesBefore?: number;
  notifyMessageCount?: number;
}): Promise<IReminder | null> {
  if (!Types.ObjectId.isValid(id)) return null;
  const reminder = await Reminder.findOne({ _id: id, workspaceId, status: "pending" });
  if (!reminder) return null;
  if (data.title) reminder.title = data.title;
  if (data.originalText !== undefined) reminder.originalText = data.originalText;
  if (data.scheduledAt) {
    reminder.scheduledAt = data.scheduledAt;
    reminder.notifySent = false;
  }
  if (data.notifyMinutesBefore !== undefined) {
    reminder.notifyMinutesBefore = data.notifyMinutesBefore;
    reminder.notifySent = false;
  }
  if (data.notifyMessageCount !== undefined) reminder.notifyMessageCount = data.notifyMessageCount;
  await reminder.save();
  return reminder;
}
export async function deleteReminder(workspaceId: string, id: string): Promise<boolean> {
  if (!Types.ObjectId.isValid(id)) return false;
  const result = await Reminder.deleteOne({ _id: id, workspaceId, status: "pending" });
  return result.deletedCount > 0;
}
export async function cancelReminder(workspaceId: string, id: string): Promise<IReminder | null> {
  if (!Types.ObjectId.isValid(id)) return null;
  return Reminder.findOneAndUpdate({ _id: id, workspaceId, status: "pending" }, { status: "cancelled" }, { new: true });
}
export async function completeReminder(workspaceId: string, id: string): Promise<IReminder | null> {
  if (!Types.ObjectId.isValid(id)) return null;
  return Reminder.findOneAndUpdate(
    { _id: id, workspaceId, status: "pending" },
    { status: "sent", sentAt: new Date() },
    { new: true }
  );
}
export async function clearCompletedReminders(workspaceId: string, ids?: string[]): Promise<number> {
  const filter: { workspaceId: string; status: string; _id?: { $in: Types.ObjectId[] } } = { workspaceId, status: "sent" };
  if (ids?.length) {
    const validIds = ids.filter((id) => Types.ObjectId.isValid(id)).map((id) => new Types.ObjectId(id));
    if (validIds.length === 0) return 0;
    filter._id = { $in: validIds };
  }
  const result = await Reminder.deleteMany(filter);
  return result.deletedCount;
}
export function formatReminderConfirmation(title: string, scheduledAt: Date, timezone: string): string {
  const formatted = formatInTimeZone(scheduledAt, timezone, "h:mm a 'on' MMM d, yyyy");
  return `Reminder created: ${title} at ${formatted}.`;
}
export async function processDueReminders(): Promise<void> {
  await processEarlyNotifications();
  let count = 0;
  while (count < 50 && (await processOneDueReminder())) {
    count += 1;
  }
}
async function processEarlyNotifications(): Promise<void> {
  const now = new Date();
  const reminders = await Reminder.find({
    status: "pending",
    notifyMinutesBefore: { $gt: 0 },
    notifySent: false,
  }).limit(20);
  for (const reminder of reminders) {
    const earlyAt = new Date(reminder.scheduledAt.getTime() - reminder.notifyMinutesBefore * 60000);
    if (now < earlyAt || now >= reminder.scheduledAt) continue;
    try {
      const label = reminder.notifyMinutesBefore === 1 ? "1 minute" : `${reminder.notifyMinutesBefore} minutes`;
      await telegramService.sendMessage(reminder.telegramChatId, `Upcoming in ${label}: ${reminderBody(reminder.title, reminder.originalText)}`);
      reminder.notifySent = true;
      await reminder.save();
      await automationService.logSuccess("reminder_early", `Early reminder sent: ${reminder.title}`, { reminderId: reminder._id });
    } catch (err) {
      const reason = err instanceof Error ? err.message : "Unknown error";
      logger.error("Early reminder send failed", reason);
    }
  }
}
async function processOneDueReminder(): Promise<boolean> {
  const now = new Date();
  const reminder = await Reminder.findOneAndUpdate(
    { status: "pending", scheduledAt: { $lte: now } },
    { status: "processing" },
    { sort: { scheduledAt: 1 }, new: true }
  );
  if (!reminder) return false;
  const total = Math.min(Math.max(reminder.notifyMessageCount ?? 1, 1), 5);
  try {
    for (let i = 1; i <= total; i += 1) {
      await telegramService.sendMessage(reminder.telegramChatId, reminderMessageText(reminder.title, reminder.originalText, i, total));
      if (i < total) await new Promise((r) => setTimeout(r, 100));
    }
    reminder.status = "sent";
    reminder.sentAt = new Date();
    await reminder.save();
    await automationService.logSuccess("reminder_sent", `Reminder sent: ${reminder.title}`, { reminderId: reminder._id });
  } catch (err) {
    const reason = err instanceof Error ? err.message : "Unknown error";
    reminder.status = "failed";
    reminder.failureReason = reason;
    await reminder.save();
    await automationService.logFailure("reminder_sent", `Failed to send reminder: ${reminder.title}`, { reminderId: reminder._id, error: reason });
    logger.error("Reminder send failed", reason);
  }
  return true;
}
export async function getDashboardReminderStats(workspaceId: string): Promise<{ pending: number; sent: number }> {
  const [pending, sent] = await Promise.all([
    Reminder.countDocuments({ workspaceId, status: "pending" }),
    Reminder.countDocuments({ workspaceId, status: "sent" }),
  ]);
  return { pending, sent };
}
