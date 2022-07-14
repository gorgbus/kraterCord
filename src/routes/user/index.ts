import { Router } from "express";
import { friendAcceptController, friendDeclineController, friendRemoveController, friendReqController, userUpdateController } from "../../controllers/user";
import { isAuthenticated } from "../../utils/middlewares";

const router = Router();

router.post("/friend/request", isAuthenticated, friendReqController);

router.post("/friend/accept", isAuthenticated, friendAcceptController);

router.post("/friend/decline", isAuthenticated, friendDeclineController);

router.post("/friend/remove", isAuthenticated, friendRemoveController);

router.post("/update", isAuthenticated, userUpdateController);


export default router;