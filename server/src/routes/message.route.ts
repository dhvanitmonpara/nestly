import { Router } from "express";
import {
  createMessage,
  deleteMessage,
  generateSuggestion,
  loadMessages,
  updateMessage,
} from "../controllers/message.controller";
import { validate } from "../middlewares/validate.middleware";
import {
  channelIdSchema,
  createMessageSchema,
  suggestMessageSchema,
  updateMessageSchema,
} from "../schema/message/message.schema";
import { generalIdSchema } from "../schema/general.schema";

const router = Router();
router.post("/create", validate(createMessageSchema), createMessage);
router.delete(
  "/delete/:id",
  validate(generalIdSchema, "params"),
  deleteMessage
);
router.put(
  "/update/:id",
  validate(generalIdSchema, "params"),
  validate(updateMessageSchema),
  updateMessage
);
router.get(
  "/chat/:userId/:channelId",
  validate(channelIdSchema, "params"),
  loadMessages
);
router.post("/suggest", validate(suggestMessageSchema), generateSuggestion);

export default router;
