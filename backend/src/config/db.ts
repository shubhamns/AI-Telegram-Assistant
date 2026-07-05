import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";
import { Conversation } from "../models/conversation.model.js";
export async function connectDb(): Promise<void> {
  await mongoose.connect(env.MONGODB_URI);
  await Conversation.syncIndexes();
  logger.info("MongoDB connected");
}
export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
  logger.info("MongoDB disconnected");
}
