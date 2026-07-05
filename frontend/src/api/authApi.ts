import api from "./axios";
import type { ApiResponse } from "@/types/dashboard";
import type { AuthSession, User, Workspace } from "@/types/auth";
import { clearStoredTokens, getStoredRefreshToken, getStoredToken, setStoredRefreshToken, setStoredToken } from "./axios";
export async function register(payload: { email: string; password: string; name: string }): Promise<{ email: string; message: string }> {
  const { data } = await api.post<ApiResponse<{ email: string; message: string }>>("/auth/register", payload);
  return data.data;
}
export async function login(payload: { email: string; password: string }): Promise<AuthSession> {
  const { data } = await api.post<ApiResponse<AuthSession>>("/auth/login", payload);
  return data.data;
}
export async function refreshAuthSession(): Promise<AuthSession | null> {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) return null;
  const { data } = await api.post<ApiResponse<AuthSession>>("/auth/refresh", { refreshToken });
  return data.data;
}
export async function logoutApi(): Promise<void> {
  const refreshToken = getStoredRefreshToken();
  try {
    await api.post("/auth/logout", { refreshToken: refreshToken || undefined }, { headers: getStoredToken() ? { Authorization: `Bearer ${getStoredToken()}` } : undefined });
  } finally {
    clearStoredTokens();
  }
}
export async function fetchMe(): Promise<{ user: User; workspace: Workspace }> {
  const { data } = await api.get<ApiResponse<{ user: User; workspace: Workspace }>>("/auth/me");
  return data.data;
}
export async function verifyEmail(token: string): Promise<{ user: User }> {
  const { data } = await api.get<ApiResponse<{ user: User }>>(`/auth/verify-email/${token}`);
  return data.data;
}
export async function resendVerification(email: string): Promise<void> {
  await api.post("/auth/resend-verification", { email });
}
export async function forgotPassword(email: string): Promise<void> {
  await api.post("/auth/forgot-password", { email });
}
export async function resetPassword(token: string, password: string): Promise<void> {
  await api.post("/auth/reset-password", { token, password });
}
export function storeAuthSession(session: AuthSession) {
  setStoredToken(session.token);
  setStoredRefreshToken(session.refreshToken);
}
