import { Router } from "express";
import * as conversationController from "../controllers/conversation.controller.js";
const router = Router();
router.get("/", conversationController.listConversations);
router.get("/:id", conversationController.getConversation);
router.get("/:id/messages", conversationController.getMessages);
export default router;
