import { AutomationLog } from "../models/automationLog.model.js";
export async function logSuccess(type: string, message: string, metadata?: Record<string, unknown>): Promise<void> {
  await AutomationLog.create({ type, status: "success", message, metadata });
}
export async function logFailure(type: string, message: string, metadata?: Record<string, unknown>): Promise<void> {
  await AutomationLog.create({ type, status: "failed", message, metadata });
}
