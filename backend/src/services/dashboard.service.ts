import * as conversationService from "./conversation.service.js";
import * as reminderService from "./reminder.service.js";
export async function getDashboardStats(workspaceId: string) {
  const [convStats, reminderStats] = await Promise.all([
    conversationService.getDashboardStats(workspaceId),
    reminderService.getDashboardReminderStats(workspaceId),
  ]);
  return {
    totalConversations: convStats.totalConversations,
    totalMessages: convStats.totalMessages,
    pendingReminders: reminderStats.pending,
    sentReminders: reminderStats.sent,
  };
}
