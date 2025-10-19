import z from "zod";

export const generalIdSchema = z.object({
  id: z.string("User ID is required"),
});