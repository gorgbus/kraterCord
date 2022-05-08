import { Router } from "express";
import { geGuildsController } from "../../controllers/guilds";
import { isAuthenticated } from "../../utils/middlewares";

const router = Router();

router.get("/", isAuthenticated, geGuildsController);

export default router;