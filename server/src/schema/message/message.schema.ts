import z from "zod";

export const createMessageSchema = z.object({
  content: z.string("Message content is required"),
  channelId: z.string("Channel ID is required"),
});

export const updateMessageSchema = z.object({
  content: z.string("Message content is required"),
});

export const channelIdSchema = z.object({
  channelId: z.string("Channel ID is required"),
});

export const suggestMessageSchema = z.object({
  text: z.string("Message text is required"),
});