import { Router } from "express";
import {
  createChannel,
  deleteChannel,
  getChannelById,
  getChannelByServer,
  updateChannel,
} from "../controllers/channel.controller";
import { channelIdSchema, createChannelSchema, serverIdSchema, updateChannelSchema } from "../schema/channel/channel.schema";
import { validate } from "../middlewares/validate.middleware";

const router = Router();
router.post("/create", validate(createChannelSchema), createChannel);
router.get("/id/:id", validate(channelIdSchema, "params"), getChannelById);
router.get("/server/:serverId", validate(serverIdSchema, "params"), getChannelByServer);
router.delete("/id/:id", validate(channelIdSchema, "params"),deleteChannel);
router.patch("/update/:id", validate(channelIdSchema, "params"), validate(updateChannelSchema), updateChannel);

export default router;
