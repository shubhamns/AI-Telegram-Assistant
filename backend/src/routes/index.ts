import express, { type Express } from "express";
import authRoutes from "./auth.routes.js";
import billingRoutes from "./billing.routes.js";
import conversationRoutes from "./conversation.routes.js";
import reminderRoutes from "./reminder.routes.js";
import telegramRoutes from "./telegram.routes.js";
import webhookRoutes from "./webhook.routes.js";
import aiRoutes from "./ai.routes.js";
import healthRoutes from "./health.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
export function registerRoutes(app: Express): void {
  app.use("/api/v1/webhooks", webhookRoutes);
  app.use(express.json({ limit: "1mb" }));
  app.use("/api/v1/health", healthRoutes);
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/dashboard", dashboardRoutes);
  app.use("/api/v1/billing", billingRoutes);
  app.use("/api/v1/conversations", conversationRoutes);
  app.use("/api/v1/reminders", reminderRoutes);
  app.use("/api/v1/telegram", telegramRoutes);
  app.use("/api/v1/ai", aiRoutes);
}
