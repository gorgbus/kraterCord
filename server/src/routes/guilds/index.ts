import { Router } from "express";
import { createGuildController, joinGuildController, getGuildMembersController, getGuildInviteController, updateMemberController } from "../../controllers/guilds";
import { multer } from "../../controllers/upload";
import { isAuthenticated } from "../../utils/middlewares";

const router = Router();

router.post('/create', isAuthenticated, multer, createGuildController);

router.post('/join/:code', isAuthenticated, joinGuildController);

router.get('/:guildId/members', isAuthenticated, getGuildMembersController);

router.get('/:guildId/invite', isAuthenticated, getGuildInviteController);

router.post("/:guildId/:memberId", isAuthenticated, updateMemberController);

export default router;