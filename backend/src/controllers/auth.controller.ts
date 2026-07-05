import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../middleware/error.middleware.js";
import * as authService from "../services/auth.service.js";
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, resendVerificationSchema, refreshTokenSchema, logoutSchema } from "../schemas/auth.schema.js";
export const register = asyncHandler(async (req: Request, res: Response) => {
  const body = registerSchema.parse(req.body);
  try {
    const data = await authService.register(body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    throw new AppError(err instanceof Error ? err.message : "Registration failed", 400);
  }
});
export const login = asyncHandler(async (req: Request, res: Response) => {
  const body = loginSchema.parse(req.body);
  try {
    const data = await authService.login(body);
    res.json({ success: true, data });
  } catch (err) {
    const fields = err && typeof err === "object" && "fields" in err ? (err as { fields?: Record<string, string> }).fields : undefined;
    throw new AppError(err instanceof Error ? err.message : "Login failed", 401, fields);
  }
});
export const me = asyncHandler(async (req: Request, res: Response) => {
  const data = await authService.getAuthContext(req.user!._id.toString());
  res.json({ success: true, data });
});
export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const token = String(req.params.token || "");
  try {
    const user = await authService.verifyEmail(token);
    res.json({ success: true, data: { user } });
  } catch (err) {
    throw new AppError(err instanceof Error ? err.message : "Verification failed", 400);
  }
});
export const resendVerification = asyncHandler(async (req: Request, res: Response) => {
  const body = resendVerificationSchema.parse(req.body);
  await authService.resendVerificationByEmail(body.email);
  res.json({ success: true, data: { sent: true } });
});
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const body = forgotPasswordSchema.parse(req.body);
  await authService.forgotPassword(body.email);
  res.json({ success: true, data: { sent: true } });
});
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const body = resetPasswordSchema.parse(req.body);
  try {
    await authService.resetPassword(body.token, body.password);
    res.json({ success: true, data: { reset: true } });
  } catch (err) {
    throw new AppError(err instanceof Error ? err.message : "Reset failed", 400);
  }
});
export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const body = refreshTokenSchema.parse(req.body);
  try {
    const data = await authService.refreshSession(body.refreshToken);
    res.json({ success: true, data });
  } catch (err) {
    throw new AppError(err instanceof Error ? err.message : "Refresh failed", 401);
  }
});
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const body = logoutSchema.parse(req.body ?? {});
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    try {
      const { userId } = authService.verifyJwt(header.slice(7));
      await authService.logout(userId);
    } catch { /* expired access token */ }
  }
  if (body.refreshToken) await authService.logoutByRefreshToken(body.refreshToken);
  res.json({ success: true, data: { loggedOut: true } });
});
