import crypto from "crypto";
import { Types } from "mongoose";
import { Workspace, type IWorkspace } from "../models/workspace.model.js";
import { PLAN_LIMITS } from "../config/plans.js";
import * as telegramService from "./telegram.service.js";
export async function getWorkspaceById(id: string): Promise<IWorkspace | null> {
  if (!Types.ObjectId.isValid(id)) return null;
  return Workspace.findById(id);
}
export async function getWorkspaceByTelegramChatId(chatId: string): Promise<IWorkspace | null> {
  return Workspace.findOne({ telegramChatId: chatId });
}
export async function getWorkspaceByLinkCode(code: string): Promise<IWorkspace | null> {
  return Workspace.findOne({ telegramLinkCode: code });
}
export async function regenerateLinkCode(workspaceId: string): Promise<{ code: string; botUsername: string; deepLink: string }> {
  const workspace = await getWorkspaceById(workspaceId);
  if (!workspace) throw new Error("Workspace not found");
  workspace.telegramLinkCode = crypto.randomBytes(4).toString("hex");
  await workspace.save();
  const bot = await telegramService.getMe();
  const username = bot.username || "bot";
  return { code: workspace.telegramLinkCode, botUsername: username, deepLink: `https://t.me/${username}?start=link_${workspace.telegramLinkCode}` };
}
export async function linkTelegram(code: string, chatId: string, profile: { username?: string; firstName?: string; lastName?: string }) {
  const workspace = await getWorkspaceByLinkCode(code.replace(/^link_/, ""));
  if (!workspace) throw new Error("Invalid link code");
  const taken = await Workspace.findOne({ telegramChatId: chatId, _id: { $ne: workspace._id } });
  if (taken) throw new Error("This Telegram account is already linked to another workspace");
  workspace.telegramChatId = chatId;
  workspace.telegramUsername = profile.username;
  workspace.telegramFirstName = profile.firstName;
  workspace.telegramLastName = profile.lastName;
  await workspace.save();
  return workspace;
}
export function getEffectivePlan(workspace: IWorkspace) {
  if (workspace.plan === "pro" && workspace.subscriptionStatus === "active") return "pro" as const;
  return "free" as const;
}
export function getLimits(workspace: IWorkspace) {
  return PLAN_LIMITS[getEffectivePlan(workspace)];
}
export async function resetUsageIfNeeded(workspace: IWorkspace): Promise<IWorkspace> {
  const now = new Date();
  const start = new Date(workspace.usage.periodStart);
  if (start.getUTCFullYear() === now.getUTCFullYear() && start.getUTCMonth() === now.getUTCMonth()) return workspace;
  workspace.usage = { aiMessages: 0, reminders: 0, brainDumps: 0, periodStart: now };
  await workspace.save();
  return workspace;
}
export async function incrementUsage(workspaceId: string, field: "aiMessages" | "reminders" | "brainDumps", amount = 1) {
  const workspace = await getWorkspaceById(workspaceId);
  if (!workspace) throw new Error("Workspace not found");
  await resetUsageIfNeeded(workspace);
  workspace.usage[field] += amount;
  await workspace.save();
}
export async function checkUsage(workspace: IWorkspace, field: "aiMessages" | "reminders" | "brainDumps") {
  const ws = await resetUsageIfNeeded(workspace);
  const limits = getLimits(ws);
  const used = ws.usage[field];
  const limit = limits[field];
  if (used >= limit) throw new Error(`${field} limit reached for your ${getEffectivePlan(ws)} plan (${limit}/${field === "aiMessages" ? "month" : "month"})`);
}
export function serializeWorkspace(workspace: IWorkspace) {
  const plan = getEffectivePlan(workspace);
  const limits = PLAN_LIMITS[plan];
  return {
    id: workspace._id.toString(),
    name: workspace.name,
    plan,
    subscriptionStatus: workspace.subscriptionStatus,
    telegramLinked: !!workspace.telegramChatId,
    telegramChatId: workspace.telegramChatId ? `${workspace.telegramChatId.slice(0, 3)}***${workspace.telegramChatId.slice(-2)}` : null,
    telegramLinkCode: workspace.telegramLinkCode,
    timezone: workspace.timezone,
    usage: workspace.usage,
    limits,
  };
}
export async function resolveWorkspaceChatId(workspace: IWorkspace): Promise<string | undefined> {
  return workspace.telegramChatId || undefined;
}
