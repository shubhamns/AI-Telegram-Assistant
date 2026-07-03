import api from "./axios";
import type { ApiResponse, DashboardStats } from "@/types/dashboard";
import type { TelegramStatus } from "@/types/telegram";
export async function fetchDashboardStats(): Promise<DashboardStats> {
  const { data } = await api.get<ApiResponse<DashboardStats>>("/dashboard/stats");
  return data.data;
}
export async function fetchTelegramStatus(): Promise<TelegramStatus> {
  const { data } = await api.get<ApiResponse<TelegramStatus>>("/telegram/status");
  return data.data;
}
export async function sendTelegramMessage(message: string): Promise<void> {
  await api.post("/telegram/send", { message });
}
