export interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  workspaceId: string;
}
export interface WorkspaceUsage {
  aiMessages: number;
  reminders: number;
  brainDumps: number;
  periodStart: string;
}
export interface WorkspaceLimits {
  aiMessages: number;
  reminders: number;
  brainDumps: number;
}
export interface Workspace {
  id: string;
  name: string;
  plan: "free" | "pro";
  subscriptionStatus: string;
  telegramLinked: boolean;
  telegramChatId: string | null;
  telegramLinkCode?: string;
  timezone: string;
  usage: WorkspaceUsage;
  limits: WorkspaceLimits;
}
export interface AuthSession {
  token: string;
  refreshToken: string;
  user: User;
  workspace: Workspace;
}
