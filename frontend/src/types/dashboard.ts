import type { Conversation } from "@/types/conversation";
import type { Reminder } from "@/types/reminder";
export interface DashboardStats {
  totalConversations: number;
  totalMessages: number;
  pendingReminders: number;
  sentReminders: number;
  failedAutomations: number;
  recentConversations: Conversation[];
  upcomingReminders: Reminder[];
  recentLogs: AutomationLog[];
}
export interface AutomationLog {
  _id: string;
  type: string;
  status: "success" | "failed";
  message: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
