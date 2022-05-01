import { Router } from "express";
import passport from "passport";
import { authLoginController, getSetupController, getUserController } from "../../controllers/auth";
import { isAuthenticated } from "../../utils/middlewares";

const router = Router();

router.get("/discord", passport.authenticate('discord'), (req, res) => {
    res.send(200);
});

router.get("/discord/redirect", passport.authenticate('discord'), authLoginController);

router.get("/status", (req, res) => {
    return req.user ? res.send(req.user) : res.status(401).send({
        msg: "Unauthorized"
    });
});

router.get("/user", isAuthenticated, getUserController);

router.get("/setup", isAuthenticated, getSetupController);

export default router;