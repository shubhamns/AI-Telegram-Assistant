import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { notFoundMiddleware } from "./middleware/notFound.middleware.js";
import { asyncHandler } from "./utils/asyncHandler.js";
import conversationRoutes from "./routes/conversation.routes.js";
import reminderRoutes from "./routes/reminder.routes.js";
import telegramRoutes from "./routes/telegram.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import * as conversationService from "./services/conversation.service.js";
import * as reminderService from "./services/reminder.service.js";
import * as automationService from "./services/automation.service.js";
import { Reminder } from "./models/reminder.model.js";
export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
  app.use(express.json({ limit: "1mb" }));
  app.get("/api/v1/health", (_req, res) => {
    res.json({ success: true, message: "API is healthy" });
  });
  app.get("/api/v1/dashboard/stats", asyncHandler(async (_req, res) => {
    const [convStats, reminderStats, failedAutomations, recentLogs, upcomingReminders] = await Promise.all([
      conversationService.getDashboardStats(),
      reminderService.getDashboardReminderStats(),
      automationService.getFailedCount(),
      automationService.getRecentLogs(5),
      Reminder.find({ status: "pending" }).sort({ scheduledAt: 1 }).limit(5),
    ]);
    res.json({
      success: true,
      data: {
        totalConversations: convStats.totalConversations,
        totalMessages: convStats.totalMessages,
        pendingReminders: reminderStats.pending,
        sentReminders: reminderStats.sent,
        failedAutomations,
        recentConversations: convStats.recentConversations,
        upcomingReminders,
        recentLogs,
      },
    });
  }));
  app.use("/api/v1/conversations", conversationRoutes);
  app.use("/api/v1/reminders", reminderRoutes);
  app.use("/api/v1/telegram", telegramRoutes);
  app.use("/api/v1/webhooks", webhookRoutes);
  app.use("/api/v1/ai", aiRoutes);
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);
  return app;
}
