import OpenAI from "openai";
import { env } from "../config/env.js";
import { reminderIntentSchema, type ReminderIntent } from "../schemas/reminder.schema.js";
import { formatInTimeZone } from "date-fns-tz";
const SYSTEM_PROMPT = "You are a concise personal AI assistant. Help with productivity, learning, planning, coding, and reminders. Keep Telegram responses clear and short unless the user asks for detail.";
let client: OpenAI | null = null;
function getClient(): OpenAI {
  if (!client) client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  return client;
}
export function setOpenAIClient(c: OpenAI | null): void {
  client = c;
}
export async function generateChatReply(messages: { role: "user" | "assistant" | "system"; content: string }[]): Promise<string> {
  const response = await getClient().chat.completions.create({
    model: env.OPENAI_MODEL,
    messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
    max_tokens: 500,
  });
  return response.choices[0]?.message?.content?.trim() || "Sorry, I could not generate a response.";
}
export async function extractReminderIntent(userMessage: string, nowIso: string, timezone: string): Promise<ReminderIntent> {
  const nowFormatted = formatInTimeZone(new Date(nowIso), timezone, "yyyy-MM-dd HH:mm:ss zzz");
  const response = await getClient().chat.completions.create({
    model: env.OPENAI_MODEL,
    messages: [
      {
        role: "system",
        content: `You classify user messages. Current datetime in ${timezone}: ${nowFormatted}. If the user wants a reminder, set intent to create_reminder and extract title and scheduledAt as ISO-8601 with timezone offset. If time is ambiguous, set scheduledAt to null. Otherwise intent is chat. Respond with valid JSON only: {"intent":"create_reminder"|"chat","title":"string","scheduledAt":"ISO or null","confidence":0.0-1.0}`,
      },
      { role: "user", content: userMessage },
    ],
    response_format: { type: "json_object" },
    max_tokens: 300,
  });
  const raw = response.choices[0]?.message?.content || "{}";
  const parsed = reminderIntentSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    return { intent: "chat", title: "", scheduledAt: null, confidence: 0 };
  }
  return parsed.data;
}
export async function generatePlan(text: string): Promise<{ title: string; time: string }[]> {
  const response = await getClient().chat.completions.create({
    model: env.OPENAI_MODEL,
    messages: [
      {
        role: "system",
        content: 'Parse the user brain dump into a task list. Return JSON: {"tasks":[{"title":"string","time":"HH:MM"}]}. Use 24h time. Max 8 tasks.',
      },
      { role: "user", content: text },
    ],
    response_format: { type: "json_object" },
    max_tokens: 500,
  });
  const raw = response.choices[0]?.message?.content || '{"tasks":[]}';
  const parsed = JSON.parse(raw) as { tasks?: { title: string; time: string }[] };
  return parsed.tasks || [];
}
