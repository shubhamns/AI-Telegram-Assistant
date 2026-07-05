import mongoose, { Schema, Document, Types } from "mongoose";
export interface IConversation extends Document {
  workspaceId: Types.ObjectId;
  telegramChatId: string;
  telegramUsername?: string;
  firstName?: string;
  lastName?: string;
  createdAt: Date;
  updatedAt: Date;
}
const conversationSchema = new Schema<IConversation>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
    telegramChatId: { type: String, required: true },
    telegramUsername: { type: String },
    firstName: { type: String },
    lastName: { type: String },
  },
  { timestamps: true }
);
conversationSchema.index({ workspaceId: 1, telegramChatId: 1 }, { unique: true });
export const Conversation = mongoose.model<IConversation>("Conversation", conversationSchema);
