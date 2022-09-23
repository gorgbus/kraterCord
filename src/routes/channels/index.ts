import { Router } from "express";
import { createChannelController, createMessageController, getChannelsController, getMessagesController, joinChannelController, leaveChannelController } from "../../controllers/channels";
import { isAuthenticated } from "../../utils/middlewares";

const router = Router();

router.get("/:guild", isAuthenticated, getChannelsController);

router.get("/messages/:id", isAuthenticated, getMessagesController);

router.post("/:id/message", isAuthenticated, createMessageController);

router.post("/create/:type", isAuthenticated, createChannelController);

router.post("/:id/join", isAuthenticated, joinChannelController);

router.post("/:id/leave", isAuthenticated, leaveChannelController);

export default router;