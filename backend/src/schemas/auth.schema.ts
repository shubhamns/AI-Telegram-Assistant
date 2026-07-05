import { z } from "zod";
export const registerSchema = z.object({ email: z.string().email(), password: z.string().min(8).max(128), name: z.string().min(1).max(100) });
export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
export const forgotPasswordSchema = z.object({ email: z.string().email() });
export const resendVerificationSchema = z.object({ email: z.string().email() });
export const resetPasswordSchema = z.object({ token: z.string().min(1), password: z.string().min(8).max(128) });
export const refreshTokenSchema = z.object({ refreshToken: z.string().min(1) });
export const logoutSchema = z.object({ refreshToken: z.string().min(1).optional() });
