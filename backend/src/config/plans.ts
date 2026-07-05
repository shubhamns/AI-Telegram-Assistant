export const PLAN_LIMITS = {
  free: { aiMessages: 50, reminders: 20, brainDumps: 10 },
  pro: { aiMessages: 500, reminders: 500, brainDumps: 100 },
} as const;
export type PlanId = keyof typeof PLAN_LIMITS;
