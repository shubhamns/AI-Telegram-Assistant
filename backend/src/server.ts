import "dotenv/config";
import { createApp } from "./app.js";
import { connectDb, disconnectDb } from "./config/db.js";
import { env } from "./config/env.js";
import { startReminderJob, stopReminderJob } from "./jobs/reminder.job.js";
import { handleTelegramUpdate } from "./webhooks/telegram.webhook.js";
import * as telegramService from "./services/telegram.service.js";
import { logger } from "./utils/logger.js";
const app = createApp();
let pollingActive = false;
let lastUpdateId = 0;
async function startPolling(): Promise<void> {
  if (pollingActive) return;
  pollingActive = true;
  logger.info("Telegram polling mode started");
  while (pollingActive) {
    try {
      const updates = await telegramService.getUpdates(lastUpdateId > 0 ? lastUpdateId + 1 : undefined);
      for (const update of updates) {
        lastUpdateId = update.update_id;
        await handleTelegramUpdate(update);
      }
      if (updates.length === 0) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    } catch (err) {
      logger.error("Polling error", err);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}
async function start(): Promise<void> {
  await connectDb();
  startReminderJob();
  if (env.TELEGRAM_MODE === "polling") {
    startPolling();
  }
  const server = app.listen(env.PORT, "0.0.0.0", () => {
    logger.info(`Server running on port ${env.PORT}`);
  });
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received, shutting down`);
    pollingActive = false;
    stopReminderJob();
    server.close(async () => {
      await disconnectDb();
      process.exit(0);
    });
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}
start().catch((err) => {
  logger.error("Failed to start server", err);
  process.exit(1);
});
