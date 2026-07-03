import api from "./axios";
import type { ApiResponse } from "@/types/dashboard";
import type { Conversation, Message } from "@/types/conversation";
export async function fetchConversations(): Promise<Conversation[]> {
  const { data } = await api.get<ApiResponse<Conversation[]>>("/conversations");
  return data.data;
}
export async function fetchConversation(id: string): Promise<Conversation> {
  const { data } = await api.get<ApiResponse<Conversation>>(`/conversations/${id}`);
  return data.data;
}
export async function fetchMessages(conversationId: string): Promise<Message[]> {
  const { data } = await api.get<ApiResponse<Message[]>>(`/conversations/${conversationId}/messages`);
  return data.data;
}
