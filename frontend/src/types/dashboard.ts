export interface DashboardStats {
  totalConversations: number;
  totalMessages: number;
  pendingReminders: number;
  sentReminders: number;
}
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
