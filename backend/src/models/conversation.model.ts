import mongoose, { Schema, Document } from "mongoose";
export interface IConversation extends Document {
  telegramChatId: string;
  telegramUsername?: string;
  firstName?: string;
  lastName?: string;
  createdAt: Date;
  updatedAt: Date;
}
const conversationSchema = new Schema<IConversation>(
  {
    telegramChatId: { type: String, required: true, unique: true, index: true },
    telegramUsername: { type: String },
    firstName: { type: String },
    lastName: { type: String },
  },
  { timestamps: true }
);
export const Conversation = mongoose.model<IConversation>("Conversation", conversationSchema);
