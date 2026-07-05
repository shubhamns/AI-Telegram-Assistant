import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { notFoundMiddleware } from "./middleware/notFound.middleware.js";
import { registerRoutes } from "./routes/index.js";
export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
  registerRoutes(app);
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);
  return app;
}
