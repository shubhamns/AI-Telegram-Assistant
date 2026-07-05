import { Types } from "mongoose";
import { Conversation, type IConversation } from "../models/conversation.model.js";
import { Message, type IMessage } from "../models/message.model.js";
import { env } from "../config/env.js";
export async function findOrCreateConversation(data: {
  workspaceId: Types.ObjectId;
  telegramChatId: string;
  telegramUsername?: string;
  firstName?: string;
  lastName?: string;
}): Promise<IConversation> {
  const existing = await Conversation.findOne({ workspaceId: data.workspaceId, telegramChatId: data.telegramChatId });
  if (existing) {
    if (data.telegramUsername) existing.telegramUsername = data.telegramUsername;
    if (data.firstName) existing.firstName = data.firstName;
    if (data.lastName) existing.lastName = data.lastName;
    await existing.save();
    return existing;
  }
  try {
    return await Conversation.create(data);
  } catch (err) {
    if ((err as { code?: number }).code === 11000) {
      const retry = await Conversation.findOne({ workspaceId: data.workspaceId, telegramChatId: data.telegramChatId });
      if (retry) return retry;
    }
    throw err;
  }
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
export async function listConversations(workspaceId: string): Promise<IConversation[]> {
  return Conversation.find({ workspaceId }).sort({ updatedAt: -1 });
}
export async function getConversationById(workspaceId: string, id: string): Promise<IConversation | null> {
  if (!Types.ObjectId.isValid(id)) return null;
  return Conversation.findOne({ _id: id, workspaceId });
}
export async function getMessagesByConversationId(workspaceId: string, id: string): Promise<IMessage[]> {
  if (!Types.ObjectId.isValid(id)) return [];
  const conversation = await getConversationById(workspaceId, id);
  if (!conversation) return [];
  return Message.find({ conversationId: id }).sort({ createdAt: 1 });
}
export async function clearConversationMessages(workspaceId: string, id: string): Promise<number | null> {
  if (!Types.ObjectId.isValid(id)) return null;
  const conversation = await getConversationById(workspaceId, id);
  if (!conversation) return null;
  const result = await Message.deleteMany({ conversationId: id });
  return result.deletedCount;
}
export async function getRecentContextMessages(conversationId: Types.ObjectId): Promise<{ role: "user" | "assistant" | "system"; content: string }[]> {
  const messages = await Message.find({ conversationId })
    .sort({ createdAt: -1 })
    .limit(env.MAX_AI_CONTEXT_MESSAGES);
  return messages.reverse().map((m) => ({ role: m.role, content: m.content }));
}
export async function getWorkspaceConversation(workspaceId: string): Promise<IConversation | null> {
  return Conversation.findOne({ workspaceId }).sort({ updatedAt: -1 });
}
export async function getDashboardStats(workspaceId: string): Promise<{ totalConversations: number; totalMessages: number }> {
  const conversations = await Conversation.find({ workspaceId }).select("_id");
  const ids = conversations.map((c) => c._id);
  const [totalConversations, totalMessages] = await Promise.all([
    conversations.length,
    ids.length ? Message.countDocuments({ conversationId: { $in: ids } }) : 0,
  ]);
  return { totalConversations, totalMessages };
}
