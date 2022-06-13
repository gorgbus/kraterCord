import { Router } from "express";
import { friendAcceptController, friendDeclineController, friendRemoveController, friendReqController } from "../../controllers/user";
import { isAuthenticated } from "../../utils/middlewares";

const router = Router();

router.post("/friend_request", isAuthenticated, friendReqController);

router.post("/friend_accept", isAuthenticated, friendAcceptController);

router.post("/friend_decline", isAuthenticated, friendDeclineController);

router.post("/friend_remove", isAuthenticated, friendRemoveController);


export default router;