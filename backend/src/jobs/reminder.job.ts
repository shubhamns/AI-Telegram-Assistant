import cron from "node-cron";
import { env } from "../config/env.js";
import * as reminderService from "../services/reminder.service.js";
import { logger } from "../utils/logger.js";
let task: cron.ScheduledTask | null = null;
export function startReminderJob(): void {
  if (env.CRON_ENABLED !== "true") {
    logger.info("Reminder cron disabled");
    return;
  }
  task = cron.schedule("* * * * *", async () => {
    try {
      await reminderService.processDueReminders();
    } catch (err) {
      logger.error("Reminder cron error", err);
    }
  });
  logger.info("Reminder cron started (every minute)");
}
export function stopReminderJob(): void {
  if (task) {
    task.stop();
    task = null;
  }
}
