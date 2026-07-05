import mongoose, { Schema, Document, Types } from "mongoose";
import type { PlanId } from "../config/plans.js";
export interface IWorkspace extends Document {
  name: string;
  ownerId: Types.ObjectId;
  plan: PlanId;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionStatus: "none" | "active" | "past_due" | "canceled";
  telegramChatId?: string;
  telegramLinkCode: string;
  telegramUsername?: string;
  telegramFirstName?: string;
  telegramLastName?: string;
  timezone: string;
  usage: {
    aiMessages: number;
    reminders: number;
    brainDumps: number;
    periodStart: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}
const workspaceSchema = new Schema<IWorkspace>(
  {
    name: { type: String, required: true, trim: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    plan: { type: String, enum: ["free", "pro"], default: "free" },
    stripeCustomerId: { type: String },
    stripeSubscriptionId: { type: String },
    subscriptionStatus: { type: String, enum: ["none", "active", "past_due", "canceled"], default: "none" },
    telegramChatId: { type: String, index: true, sparse: true },
    telegramLinkCode: { type: String, required: true, unique: true },
    telegramUsername: { type: String },
    telegramFirstName: { type: String },
    telegramLastName: { type: String },
    timezone: { type: String, required: true },
    usage: {
      aiMessages: { type: Number, default: 0 },
      reminders: { type: Number, default: 0 },
      brainDumps: { type: Number, default: 0 },
      periodStart: { type: Date, default: () => new Date() },
    },
  },
  { timestamps: true }
);
export const Workspace = mongoose.model<IWorkspace>("Workspace", workspaceSchema);
