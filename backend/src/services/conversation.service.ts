import { Types } from "mongoose";
import { Conversation, type IConversation } from "../models/conversation.model.js";
import { Message, type IMessage } from "../models/message.model.js";
import { env } from "../config/env.js";
export async function findOrCreateConversation(data: {
  telegramChatId: string;
  telegramUsername?: string;
  firstName?: string;
  lastName?: string;
}): Promise<IConversation> {
  const existing = await Conversation.findOne({ telegramChatId: data.telegramChatId });
  if (existing) {
    if (data.telegramUsername) existing.telegramUsername = data.telegramUsername;
    if (data.firstName) existing.firstName = data.firstName;
    if (data.lastName) existing.lastName = data.lastName;
    await existing.save();
    return existing;
  }
  return Conversation.create(data);
}
export async function saveMessage(data: {
  conversationId: Types.ObjectId;
  role: "user" | "assistant" | "system";
  content: string;
  source: "telegram" | "dashboard" | "automation";
  telegramMessageId?: number;
}): Promise<IMessage> {
  return Message.create(data);
}
export async function listConversations(): Promise<IConversation[]> {
  return Conversation.find().sort({ updatedAt: -1 });
}
export async function getConversationById(id: string): Promise<IConversation | null> {
  if (!Types.ObjectId.isValid(id)) return null;
  return Conversation.findById(id);
}
export async function getMessagesByConversationId(id: string): Promise<IMessage[]> {
  if (!Types.ObjectId.isValid(id)) return [];
  return Message.find({ conversationId: id }).sort({ createdAt: 1 });
}
export async function clearConversationMessages(id: string): Promise<number | null> {
  if (!Types.ObjectId.isValid(id)) return null;
  const conversation = await Conversation.findById(id);
  if (!conversation) return null;
  const result = await Message.deleteMany({ conversationId: id });
  await conversation.save();
  return result.deletedCount;
}
export async function getRecentContextMessages(conversationId: Types.ObjectId): Promise<{ role: "user" | "assistant" | "system"; content: string }[]> {
  const messages = await Message.find({ conversationId })
    .sort({ createdAt: -1 })
    .limit(env.MAX_AI_CONTEXT_MESSAGES);
  return messages.reverse().map((m) => ({ role: m.role, content: m.content }));
}
export async function getLatestConversation(): Promise<IConversation | null> {
  return Conversation.findOne().sort({ updatedAt: -1 });
}
export async function getDashboardStats(): Promise<{
  totalConversations: number;
  totalMessages: number;
  recentConversations: IConversation[];
}> {
  const [totalConversations, totalMessages, recentConversations] = await Promise.all([
    Conversation.countDocuments(),
    Message.countDocuments(),
    Conversation.find().sort({ updatedAt: -1 }).limit(5),
  ]);
  return { totalConversations, totalMessages, recentConversations };
}
