import mongoose, { Schema, Document } from "mongoose";
export type ReminderStatus = "pending" | "processing" | "sent" | "failed" | "cancelled";
export interface IReminder extends Document {
  telegramChatId: string;
  title: string;
  originalText?: string;
  scheduledAt: Date;
  timezone: string;
  status: ReminderStatus;
  notifyMinutesBefore: number;
  notifySent: boolean;
  sentAt?: Date;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}
const reminderSchema = new Schema<IReminder>(
  {
    telegramChatId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    originalText: { type: String },
    scheduledAt: { type: Date, required: true, index: true },
    timezone: { type: String, required: true },
    status: { type: String, enum: ["pending", "processing", "sent", "failed", "cancelled"], default: "pending", index: true },
    notifyMinutesBefore: { type: Number, default: 0 },
    notifySent: { type: Boolean, default: false },
    sentAt: { type: Date },
    failureReason: { type: String },
  },
  { timestamps: true }
);
export const Reminder = mongoose.model<IReminder>("Reminder", reminderSchema);
