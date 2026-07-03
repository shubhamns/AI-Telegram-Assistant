import mongoose, { Schema, Document } from "mongoose";
export interface IAutomationLog extends Document {
  type: string;
  status: "success" | "failed";
  message: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}
const automationLogSchema = new Schema<IAutomationLog>(
  {
    type: { type: String, required: true, index: true },
    status: { type: String, enum: ["success", "failed"], required: true },
    message: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
export const AutomationLog = mongoose.model<IAutomationLog>("AutomationLog", automationLogSchema);
