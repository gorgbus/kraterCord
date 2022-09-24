import { Router } from "express";
import { friendAcceptController, friendDeclineController, friendRemoveController, friendReqController, userCreateNotificationController, userDeleteNotificationController, userUpdateController, userUpdateVoiceController } from "../../controllers/user";
import { isAuthenticated } from "../../utils/middlewares";

const router = Router();

router.post("/friend/request", isAuthenticated, friendReqController);

router.post("/friend/accept", isAuthenticated, friendAcceptController);

router.post("/friend/decline", isAuthenticated, friendDeclineController);

router.post("/friend/remove", isAuthenticated, friendRemoveController);

router.post("/update", isAuthenticated, userUpdateController);

router.post("/update/voice", isAuthenticated, userUpdateVoiceController);

router.post("/notification", isAuthenticated, userCreateNotificationController);

router.delete("/notification/:notificationId", isAuthenticated, userDeleteNotificationController);

export default router;