import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";
const BASE_URL = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}`;
async function telegramFetch(method: string, body?: Record<string, unknown>): Promise<unknown> {
  const res = await fetch(`${BASE_URL}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json() as { ok: boolean; description?: string; result?: unknown };
  if (!data.ok) {
    logger.error(`Telegram API ${method} failed`, data.description);
    throw new Error(data.description || `Telegram API error: ${method}`);
  }
  return data.result;
}
export async function getMe(): Promise<{ id: number; is_bot: boolean; first_name: string; username?: string }> {
  const res = await fetch(`${BASE_URL}/getMe`);
  const data = await res.json() as { ok: boolean; result?: { id: number; is_bot: boolean; first_name: string; username?: string }; description?: string };
  if (!data.ok) throw new Error(data.description || "getMe failed");
  return data.result!;
}
export async function sendMessage(chatId: string | number, text: string): Promise<unknown> {
  return telegramFetch("sendMessage", { chat_id: chatId, text });
}
export async function setWebhook(url: string, secretToken: string): Promise<unknown> {
  return telegramFetch("setWebhook", { url, secret_token: secretToken });
}
export async function getWebhookInfo(): Promise<unknown> {
  const res = await fetch(`${BASE_URL}/getWebhookInfo`);
  const data = await res.json() as { ok: boolean; result?: unknown; description?: string };
  if (!data.ok) throw new Error(data.description || "getWebhookInfo failed");
  return data.result;
}
export async function getUpdates(offset?: number): Promise<{ update_id: number; message?: { message_id: number; chat: { id: number }; text?: string; from?: { id: number; username?: string; first_name?: string; last_name?: string } } }[]> {
  const body: Record<string, unknown> = { timeout: 0 };
  if (offset !== undefined) body.offset = offset;
  const result = await telegramFetch("getUpdates", body);
  return result as { update_id: number; message?: { message_id: number; chat: { id: number }; text?: string; from?: { id: number; username?: string; first_name?: string; last_name?: string } } }[];
}
