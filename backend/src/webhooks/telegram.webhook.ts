import type { Types } from "mongoose";
import * as conversationService from "../services/conversation.service.js";
import * as reminderService from "../services/reminder.service.js";
import * as openaiService from "../services/openai.service.js";
import * as telegramService from "../services/telegram.service.js";
import * as automationService from "../services/automation.service.js";
import { env } from "../config/env.js";
import { telegramUpdateSchema } from "../schemas/telegram.schema.js";
type ConversationDoc = Awaited<ReturnType<typeof conversationService.findOrCreateConversation>>;
async function replyInChat(conversationId: Types.ObjectId, chatId: string, content: string): Promise<void> {
  await telegramService.sendMessage(chatId, content);
  await conversationService.saveMessage({ conversationId, role: "assistant", content, source: "telegram" });
}
async function handleStart(conversation: ConversationDoc, chatId: string): Promise<void> {
  const content = "AI-Telegram-Assistant connected successfully.";
  await replyInChat(conversation._id, chatId, content);
}
async function handleReminderIntent(conversation: ConversationDoc, chatId: string, text: string, intent: Awaited<ReturnType<typeof openaiService.extractReminderIntent>>): Promise<boolean> {
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
  const reminder = await reminderService.createReminder({
    title: intent.title || text,
    scheduledAt,
    telegramChatId: chatId,
    originalText: text,
  });
  const reply = reminderService.formatReminderConfirmation(reminder.title, reminder.scheduledAt);
  await replyInChat(conversation._id, chatId, reply);
  await automationService.logSuccess("reminder_created", `Reminder created via Telegram: ${reminder.title}`, { reminderId: reminder._id });
  return true;
}
async function handleChatReply(conversation: ConversationDoc, chatId: string): Promise<void> {
  const context = await conversationService.getRecentContextMessages(conversation._id);
  const aiReply = await openaiService.generateChatReply(context);
  await replyInChat(conversation._id, chatId, aiReply);
}
export async function handleTelegramUpdate(body: unknown): Promise<void> {
  const parsed = telegramUpdateSchema.safeParse(body);
  if (!parsed.success || !parsed.data.message) return;
  const msg = parsed.data.message;
  const chatId = String(msg.chat.id);
  const text = msg.text?.trim();
  if (!text) return;
  const conversation = await conversationService.findOrCreateConversation({
    telegramChatId: chatId,
    telegramUsername: msg.from?.username || msg.chat.username,
    firstName: msg.from?.first_name || msg.chat.first_name,
    lastName: msg.from?.last_name || msg.chat.last_name,
  });
  if (text === "/start") {
    await handleStart(conversation, chatId);
    return;
  }
  await conversationService.saveMessage({
    conversationId: conversation._id,
    role: "user",
    content: text,
    source: "telegram",
    telegramMessageId: msg.message_id,
  });
  const intent = await openaiService.extractReminderIntent(text, new Date().toISOString(), env.APP_TIMEZONE);
  if (await handleReminderIntent(conversation, chatId, text, intent)) return;
  await handleChatReply(conversation, chatId);
}
