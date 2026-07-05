import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
export const health = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, message: "API is healthy" });
});
