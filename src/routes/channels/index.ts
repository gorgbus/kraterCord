import { Router } from "express";
import { createChannelController, createMessageController, geChannelsController, getDMController, getMessagesController } from "../../controllers/channels";
import { isAuthenticated } from "../../utils/middlewares";

const router = Router();

router.get("/channels/:guild", isAuthenticated, geChannelsController);

router.get("/dms", isAuthenticated, getDMController);

router.get("/channels/messages/:id", isAuthenticated, getMessagesController);

router.post("/channels/:id/message", isAuthenticated, createMessageController);

router.post("/channels/create/:type", isAuthenticated, createChannelController);

export default router;