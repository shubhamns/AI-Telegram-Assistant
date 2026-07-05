import { Router } from "express";
import * as dashboardController from "../controllers/dashboard.controller.js";
import { authMiddleware, requireVerifiedEmail } from "../middleware/auth.middleware.js";
const router = Router();
router.use(authMiddleware, requireVerifiedEmail);
router.get("/stats", dashboardController.getStats);
export default router;
