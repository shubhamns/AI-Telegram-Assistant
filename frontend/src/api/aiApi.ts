import api from "./axios";
import type { ApiResponse } from "@/types/dashboard";
export async function sendAiChat(message: string): Promise<string> {
  const { data } = await api.post<ApiResponse<{ reply: string }>>("/ai/chat", { message });
  return data.data.reply;
}
export async function generatePlan(text: string): Promise<{ title: string; time: string }[]> {
  const { data } = await api.post<ApiResponse<{ tasks: { title: string; time: string }[] }>>("/ai/plan", { text });
  return data.data.tasks;
}
