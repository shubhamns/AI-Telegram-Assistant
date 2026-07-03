import { z } from "zod";
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string().min(1),
  CLIENT_URL: z.string().url(),
  OPENAI_API_KEY: z.string().min(1),
  OPENAI_MODEL: z.string().min(1),
  MAX_AI_CONTEXT_MESSAGES: z.coerce.number().default(10),
  TELEGRAM_BOT_TOKEN: z.string().min(1),
  TELEGRAM_CHAT_ID: z.string().optional(),
  TELEGRAM_WEBHOOK_SECRET: z.string().min(1),
  BACKEND_PUBLIC_URL: z.string().optional(),
  APP_TIMEZONE: z.string().min(1),
  TELEGRAM_MODE: z.enum(["polling", "webhook"]).default("polling"),
  CRON_ENABLED: z.enum(["true", "false"]).default("true"),
});
export type Env = z.infer<typeof envSchema>;
export function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
    process.exit(1);
  }
  return parsed.data;
}
export const env = loadEnv();
