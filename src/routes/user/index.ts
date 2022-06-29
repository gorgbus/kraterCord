import { Router } from "express";
import { friendAcceptController, friendDeclineController, friendRemoveController, friendReqController } from "../../controllers/user";
import { isAuthenticated } from "../../utils/middlewares";

const router = Router();

router.post("/friend/request", isAuthenticated, friendReqController);

router.post("/friend/accept", isAuthenticated, friendAcceptController);

router.post("/friend/decline", isAuthenticated, friendDeclineController);

router.post("/friend/remove", isAuthenticated, friendRemoveController);


export default router;