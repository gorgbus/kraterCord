import { Router } from "express";
import { createGuildController, joinGuildController, getGuildMembersController, getGuildInviteController } from "../../controllers/guilds";
import { multer } from "../../controllers/upload";
import { isAuthenticated } from "../../utils/middlewares";

const router = Router();

router.post('/create', isAuthenticated, multer, createGuildController);

router.post('/join/:id', isAuthenticated, joinGuildController);

router.get('/:id/members', isAuthenticated, getGuildMembersController);

router.get('/:id/invite', isAuthenticated, getGuildInviteController);

export default router;