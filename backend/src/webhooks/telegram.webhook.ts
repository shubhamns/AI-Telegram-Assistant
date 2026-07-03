import * as conversationService from "../services/conversation.service.js";
import * as reminderService from "../services/reminder.service.js";
import * as openaiService from "../services/openai.service.js";
import * as telegramService from "../services/telegram.service.js";
import * as automationService from "../services/automation.service.js";
import { env } from "../config/env.js";
import { telegramUpdateSchema } from "../schemas/telegram.schema.js";
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
    await telegramService.sendMessage(chatId, "AI Telegram Assistant connected successfully.");
    await conversationService.saveMessage({
      conversationId: conversation._id,
      role: "assistant",
      content: "AI Telegram Assistant connected successfully.",
      source: "telegram",
    });
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
  if (intent.intent === "create_reminder" && intent.confidence >= 0.7) {
    if (!intent.scheduledAt) {
      const reply = "I understood you want a reminder, but the time was unclear. Please specify when (e.g. tomorrow at 6:30 PM).";
      await telegramService.sendMessage(chatId, reply);
      await conversationService.saveMessage({ conversationId: conversation._id, role: "assistant", content: reply, source: "telegram" });
      return;
    }
    const scheduledAt = new Date(intent.scheduledAt);
    if (isNaN(scheduledAt.getTime())) {
      const reply = "I could not parse the reminder time. Please try again with a clearer time.";
      await telegramService.sendMessage(chatId, reply);
      await conversationService.saveMessage({ conversationId: conversation._id, role: "assistant", content: reply, source: "telegram" });
      return;
    }
    const reminder = await reminderService.createReminder({
      title: intent.title || text,
      scheduledAt,
      telegramChatId: chatId,
      originalText: text,
    });
    const reply = reminderService.formatReminderConfirmation(reminder.title, reminder.scheduledAt);
    await telegramService.sendMessage(chatId, reply);
    await conversationService.saveMessage({ conversationId: conversation._id, role: "assistant", content: reply, source: "telegram" });
    await automationService.logSuccess("reminder_created", `Reminder created via Telegram: ${reminder.title}`, { reminderId: reminder._id });
    return;
  }
  const context = await conversationService.getRecentContextMessages(conversation._id);
  const aiReply = await openaiService.generateChatReply(context);
  await telegramService.sendMessage(chatId, aiReply);
  await conversationService.saveMessage({ conversationId: conversation._id, role: "assistant", content: aiReply, source: "telegram" });
}
