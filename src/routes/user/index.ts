import { Router } from "express";
import { friendAcceptController, friendDeclineController, friendRemoveController, friendReqController } from "../../controllers/user";
import { isAuthenticatedClient } from "../../utils/middlewares";

const router = Router();

router.post("/friend_request", isAuthenticatedClient, friendReqController);

router.post("/friend_accept", isAuthenticatedClient, friendAcceptController);

router.post("/friend_decline", isAuthenticatedClient, friendDeclineController);

router.post("/friend_remove", isAuthenticatedClient, friendRemoveController);


export default router;