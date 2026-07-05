export interface TelegramStatus {
  connected: boolean;
  botUsername?: string;
  botName?: string;
  userDisplayName?: string | null;
  chatId?: string | null;
  telegramLinked?: boolean;
  mode: string;
}
