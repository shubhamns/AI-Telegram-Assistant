import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
export class AppError extends Error {
  statusCode: number;
  fields?: Record<string, string>;
  constructor(message: string, statusCode = 500, fields?: Record<string, string>) {
    super(message);
    this.statusCode = statusCode;
    this.fields = fields;
  }
}
export function errorMiddleware(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ZodError) {
    res.status(400).json({ success: false, message: err.errors[0]?.message || "Validation error" });
    return;
  }
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err instanceof AppError ? err.message : "Internal server error";
  const fields = err instanceof AppError ? err.fields : undefined;
  if (statusCode >= 500) console.error(err);
  res.status(statusCode).json({ success: false, message, ...(fields ? { fields } : {}) });
}
