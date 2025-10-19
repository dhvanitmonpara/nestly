import { Router } from "express";
import {
  createDirectConversation,
  deleteDirectConversation,
  deleteDirectMessage,
  getConversationUser,
  getDirectConversationMessages,
  listDirectConversations,
  updateDirectMessage,
} from "../controllers/dms.controller";
import { validate } from "../middlewares/validate.middleware";
import {
  dmMessageContentSchema,
  userDMConversationSchema,
} from "../schema/dm/dm.schema";
import { generalIdSchema } from "../schema/general.schema";

const router = Router();
router.post(
  "/create",
  validate(userDMConversationSchema),
  createDirectConversation
);
router.get("/list/:userId", listDirectConversations);
router.delete(
  "/delete/:id",
  validate(generalIdSchema, "params"),
  deleteDirectConversation
);
router.get(
  "/messages/:id",
  validate(generalIdSchema, "params"),
  getDirectConversationMessages
);
router.delete(
  "/messages/:id",
  validate(generalIdSchema, "params"),
  deleteDirectMessage
);
router.put(
  "/messages/:id",
  validate(generalIdSchema, "params"),
  validate(dmMessageContentSchema),
  updateDirectMessage
);
router.get(
  "/messages/:id/users",
  validate(generalIdSchema, "params"),
  getConversationUser
);

export default router;
