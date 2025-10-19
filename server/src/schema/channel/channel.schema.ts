import z from "zod";

export const createChannelSchema = z.object({
  name:z.string("Channel name is required"),
  serverId: z.string("Server ID is required"),
  type: z.enum(["text", "voice"]).optional(),
})

export const channelIdSchema = z.object({
  id: z.string("Channel ID is required"),
}); 

export const serverIdSchema = z.object({
  serverId: z.string("Server ID is required"),
});

export const updateChannelSchema = z.object({
  name: z.string("Channel name is required"),
});