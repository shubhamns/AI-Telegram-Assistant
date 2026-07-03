import mongoose, { Schema, Document, Types } from "mongoose";
export type MessageRole = "user" | "assistant" | "system";
export type MessageSource = "telegram" | "dashboard" | "automation";
export interface IMessage extends Document {
  conversationId: Types.ObjectId;
  telegramMessageId?: number;
  role: MessageRole;
  content: string;
  source: MessageSource;
  createdAt: Date;
}
const messageSchema = new Schema<IMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true, index: true },
    telegramMessageId: { type: Number },
    role: { type: String, enum: ["user", "assistant", "system"], required: true },
    content: { type: String, required: true },
    source: { type: String, enum: ["telegram", "dashboard", "automation"], required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
export const Message = mongoose.model<IMessage>("Message", messageSchema);
