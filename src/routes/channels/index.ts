import { Router } from "express";
import { createChannelController, createMessageController, geChannelsController, getDMController, getMessagesController } from "../../controllers/channels";
import { isAuthenticated, isAuthenticatedClient } from "../../utils/middlewares";

const router = Router();

router.get("/channels/:guild", isAuthenticatedClient, geChannelsController);

router.get("/dms", isAuthenticated, getDMController);

router.get("/channels/messages/:id", isAuthenticatedClient, getMessagesController);

router.post("/channels/:id/message", isAuthenticatedClient, createMessageController);

router.post("/channels/create/:type", isAuthenticatedClient, createChannelController);

export default router;