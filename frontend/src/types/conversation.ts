export interface Conversation {
  _id: string;
  telegramChatId: string;
  telegramUsername?: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
  updatedAt: string;
}
export interface Message {
  _id: string;
  conversationId: string;
  telegramMessageId?: number;
  role: "user" | "assistant" | "system";
  content: string;
  source: "telegram" | "dashboard" | "automation";
  createdAt: string;
}
