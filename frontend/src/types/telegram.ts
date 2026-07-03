export interface TelegramStatus {
  connected: boolean;
  botUsername?: string;
  botName?: string;
  userDisplayName?: string | null;
  chatId?: string | null;
  mode: string;
}
