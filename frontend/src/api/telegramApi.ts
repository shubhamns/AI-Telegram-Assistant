import api from "./axios";
import type { TelegramStatus } from "@/types/telegram";
import type { ApiResponse, DashboardStats } from "@/types/dashboard";
export async function fetchDashboardStats(): Promise<DashboardStats> {
  const { data } = await api.get<ApiResponse<DashboardStats>>("/dashboard/stats");
  return data.data;
}
export async function fetchTelegramStatus(): Promise<TelegramStatus> {
  const { data } = await api.get<ApiResponse<TelegramStatus>>("/telegram/status");
  return data.data;
}
export async function fetchTelegramLink(): Promise<{ code: string; botUsername: string; deepLink: string }> {
  const { data } = await api.get<ApiResponse<{ code: string; botUsername: string; deepLink: string }>>("/telegram/link");
  return data.data;
}
export async function sendTelegramMessage(message: string): Promise<void> {
  await api.post("/telegram/send", { message });
}
