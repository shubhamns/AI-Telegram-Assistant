import type { Types } from "mongoose";
import * as conversationService from "../services/conversation.service.js";
import * as reminderService from "../services/reminder.service.js";
import * as openaiService from "../services/openai.service.js";
import * as telegramService from "../services/telegram.service.js";
import * as automationService from "../services/automation.service.js";
import * as workspaceService from "../services/workspace.service.js";
import { telegramUpdateSchema } from "../schemas/telegram.schema.js";
type ConversationDoc = Awaited<ReturnType<typeof conversationService.findOrCreateConversation>>;
async function replyInChat(conversationId: Types.ObjectId, chatId: string, content: string): Promise<void> {
  await telegramService.sendMessage(chatId, content);
  await conversationService.saveMessage({ conversationId, role: "assistant", content, source: "telegram" });
}
async function handleLinkStart(chatId: string, text: string, profile: { username?: string; firstName?: string; lastName?: string }) {
  const code = text.replace(/^\/start\s+link_?/i, "").trim();
  if (!code) {
    await telegramService.sendMessage(chatId, "Open Settings in the dashboard and tap Connect Telegram to get your link code.");
    return;
  }
  try {
    const workspace = await workspaceService.linkTelegram(code, chatId, {
      username: profile.username,
      firstName: profile.firstName,
      lastName: profile.lastName,
    });
    const conversation = await conversationService.findOrCreateConversation({
      workspaceId: workspace._id,
      telegramChatId: chatId,
      telegramUsername: profile.username,
      firstName: profile.firstName,
      lastName: profile.lastName,
    });
    await replyInChat(conversation._id, chatId, `Telegram linked to ${workspace.name}. You're all set!`);
  } catch (err) {
    await telegramService.sendMessage(chatId, err instanceof Error ? err.message : "Link failed");
  }
}
async function handleReminderIntent(workspaceId: Types.ObjectId, conversation: ConversationDoc, chatId: string, text: string, intent: Awaited<ReturnType<typeof openaiService.extractReminderIntent>>, timezone: string): Promise<boolean> {
  if (intent.intent !== "create_reminder" || intent.confidence < 0.7) return false;
  if (!intent.scheduledAt) {
    await replyInChat(conversation._id, chatId, "I understood you want a reminder, but the time was unclear. Please specify when (e.g. tomorrow at 6:30 PM).");
    return true;
  }
  const scheduledAt = new Date(intent.scheduledAt);
  if (isNaN(scheduledAt.getTime())) {
    await replyInChat(conversation._id, chatId, "I could not parse the reminder time. Please try again with a clearer time.");
    return true;
  }
  try {
    await workspaceService.checkUsage(await workspaceService.getWorkspaceById(workspaceId.toString()) as NonNullable<Awaited<ReturnType<typeof workspaceService.getWorkspaceById>>>, "reminders");
  } catch (err) {
    await replyInChat(conversation._id, chatId, err instanceof Error ? err.message : "Reminder limit reached");
    return true;
  }
  const reminder = await reminderService.createReminder({
    workspaceId,
    title: intent.title || text,
    scheduledAt,
    telegramChatId: chatId,
    originalText: text,
    timezone,
  });
  await workspaceService.incrementUsage(workspaceId.toString(), "reminders");
  const reply = reminderService.formatReminderConfirmation(reminder.title, reminder.scheduledAt, timezone);
  await replyInChat(conversation._id, chatId, reply);
  await automationService.logSuccess("reminder_created", `Reminder created via Telegram: ${reminder.title}`, { reminderId: reminder._id });
  return true;
}
async function handleChatReply(workspaceId: Types.ObjectId, conversation: ConversationDoc, chatId: string) {
  try {
    const workspace = await workspaceService.getWorkspaceById(workspaceId.toString());
    if (workspace) await workspaceService.checkUsage(workspace, "aiMessages");
  } catch (err) {
    await replyInChat(conversation._id, chatId, err instanceof Error ? err.message : "AI message limit reached");
    return;
  }
  const context = await conversationService.getRecentContextMessages(conversation._id);
  const aiReply = await openaiService.generateChatReply(context);
  await replyInChat(conversation._id, chatId, aiReply);
  await workspaceService.incrementUsage(workspaceId.toString(), "aiMessages");
}
export async function handleTelegramUpdate(body: unknown): Promise<void> {
  const parsed = telegramUpdateSchema.safeParse(body);
  if (!parsed.success || !parsed.data.message) return;
  const msg = parsed.data.message;
  const chatId = String(msg.chat.id);
  const text = msg.text?.trim();
  if (!text) return;
  const profile = {
    username: msg.from?.username || msg.chat.username,
    firstName: msg.from?.first_name || msg.chat.first_name,
    lastName: msg.from?.last_name || msg.chat.last_name,
  };
  if (text.toLowerCase().startsWith("/start")) {
    if (/^\/start\s+link_/i.test(text)) {
      await handleLinkStart(chatId, text, profile);
      return;
    }
    await telegramService.sendMessage(chatId, "Welcome! Connect your account from the dashboard Settings page, then open the Telegram link.");
    return;
  }
  const workspace = await workspaceService.getWorkspaceByTelegramChatId(chatId);
  if (!workspace) {
    await telegramService.sendMessage(chatId, "This Telegram chat is not linked. Connect from dashboard Settings first.");
    return;
  }
  const conversation = await conversationService.findOrCreateConversation({
    workspaceId: workspace._id,
    telegramChatId: chatId,
    telegramUsername: profile.username,
    firstName: profile.firstName,
    lastName: profile.lastName,
  });
  await conversationService.saveMessage({
    conversationId: conversation._id,
    role: "user",
    content: text,
    source: "telegram",
    telegramMessageId: msg.message_id,
  });
  const intent = await openaiService.extractReminderIntent(text, new Date().toISOString(), workspace.timezone);
  if (await handleReminderIntent(workspace._id, conversation, chatId, text, intent, workspace.timezone)) return;
  await handleChatReply(workspace._id, conversation, chatId);
}
