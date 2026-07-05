import api from "./axios";
import type { ApiResponse } from "@/types/dashboard";
import type { Reminder, ReminderStatus } from "@/types/reminder";
export async function fetchReminders(status?: ReminderStatus): Promise<Reminder[]> {
  const { data } = await api.get<ApiResponse<Reminder[]>>("/reminders", { params: status ? { status } : {} });
  return data.data;
}
export async function createReminder(payload: {
  title: string;
  scheduledAt: string;
  originalText?: string;
  notifyMinutesBefore?: number;
  notifyMessageCount?: number;
}): Promise<Reminder> {
  const { data } = await api.post<ApiResponse<Reminder>>("/reminders", payload);
  return data.data;
}
export async function updateReminder(id: string, payload: {
  title?: string;
  scheduledAt?: string;
  originalText?: string;
  notifyMinutesBefore?: number;
  notifyMessageCount?: number;
}): Promise<Reminder> {
  const { data } = await api.put<ApiResponse<Reminder>>(`/reminders/${id}`, payload);
  return data.data;
}
export async function deleteReminder(id: string): Promise<void> {
  await api.delete(`/reminders/${id}`);
}
export async function completeReminder(id: string): Promise<Reminder> {
  const { data } = await api.patch<ApiResponse<Reminder>>(`/reminders/${id}/complete`);
  return data.data;
}
export async function clearCompletedReminders(ids?: string[]): Promise<number> {
  const { data } = await api.post<ApiResponse<{ deleted: number }>>("/reminders/clear-completed", ids?.length ? { ids } : {});
  return data.data.deleted;
}
