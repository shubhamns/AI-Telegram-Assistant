import { z } from "zod";
export const sendMessageSchema = z.object({
  message: z.string().min(1).max(4096),
});
export const setWebhookSchema = z.object({
  url: z.string().url().optional(),
});
export const telegramUpdateSchema = z.object({
  update_id: z.number(),
  message: z.object({
    message_id: z.number(),
    from: z.object({
      id: z.number(),
      is_bot: z.boolean().optional(),
      first_name: z.string().optional(),
      last_name: z.string().optional(),
      username: z.string().optional(),
    }).optional(),
    chat: z.object({
      id: z.number(),
      type: z.string(),
      username: z.string().optional(),
      first_name: z.string().optional(),
      last_name: z.string().optional(),
    }),
    date: z.number(),
    text: z.string().optional(),
  }).optional(),
}).passthrough();
