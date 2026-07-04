export type ReminderStatus = "pending" | "processing" | "sent" | "failed" | "cancelled";
export interface Reminder {
  _id: string;
  telegramChatId: string;
  title: string;
  originalText?: string;
  scheduledAt: string;
  timezone: string;
  status: ReminderStatus;
  notifyMinutesBefore?: number;
  notifyMessageCount?: number;
  notifySent?: boolean;
  sentAt?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}
