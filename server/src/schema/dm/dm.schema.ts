import z from "zod";

export const userDMConversationSchema = z.object({
  userId1: z.number("User ID 1 is required"),
  userId2: z.number("User ID 2 is required"),
});

export const dmMessageContentSchema = z.object({
  content: z.string("Message content is required"),
});