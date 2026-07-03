import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as aiController from "../controllers/ai.controller.js";
const router = Router();
const limiter = rateLimit({ windowMs: 60 * 1000, max: 20, message: { success: false, message: "Too many requests" } });
router.post("/chat", limiter, aiController.chat);
router.post("/plan", limiter, aiController.plan);
export default router;
