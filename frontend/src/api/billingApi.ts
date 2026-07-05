import api from "./axios";
import type { ApiResponse } from "@/types/dashboard";
import type { Workspace } from "@/types/auth";
export async function fetchBillingUsage(): Promise<Workspace> {
  const { data } = await api.get<ApiResponse<Workspace>>("/billing/usage");
  return data.data;
}
export async function fetchPlans(): Promise<{ plans: { id: string; name: string; price: number; limits: Workspace["limits"] }[]; enabled: boolean }> {
  const { data } = await api.get<ApiResponse<{ plans: { id: string; name: string; price: number; limits: Workspace["limits"] }[]; enabled: boolean }>>("/billing/plans");
  return data.data;
}
export async function createCheckout(): Promise<{ url: string | null }> {
  const { data } = await api.post<ApiResponse<{ url: string | null }>>("/billing/checkout");
  return data.data;
}
export async function createPortal(): Promise<{ url: string | null }> {
  const { data } = await api.post<ApiResponse<{ url: string | null }>>("/billing/portal");
  return data.data;
}
