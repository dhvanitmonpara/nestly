import { Router } from "express";
import {
  createServer,
  joinServer,
  leaveServer,
  getJoinedServer,
  getServerDetailsById,
  deleteServer,
  updateServer,
  getMembersByServer,
  kickMember,
} from "../controllers/server.controller";

const router = Router();
router.post("/create", createServer);
router.post("/join", joinServer);
router.delete("/leave/:serverId", leaveServer);
router.get("/joined/:userId", getJoinedServer);
router.delete("/delete/:serverId", deleteServer);
router.put("/update/:serverId", updateServer);
router.get("/id/:serverId", getServerDetailsById);
router.get("/members/:serverId", getMembersByServer);
router.delete("/:serverId/members/:userId/kick", kickMember);

export default router;
