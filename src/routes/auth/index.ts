import { Request, Router } from "express";
import passport from "passport";
import { authLoginController, checkAuthController, getSetupController, getUserController } from "../../controllers/auth";
import { isAuthenticated } from "../../utils/middlewares";

const router = Router();

router.get("/discord", (req, res, next) => {
    const redir = req.query.redir;

    if (!redir) return res.status(403).redirect('/status');

    const authenticator = passport.authenticate('discord', { session: false, state: redir.toString() });

    authenticator(req, res, next);
}, (req, res) => {
    res.send(200);
});

router.get("/discord/redirect", passport.authenticate('discord', { session: false }), authLoginController);

router.get("/status", (req, res) => {
    return req.user ? res.send(req.user) : res.status(401).send({
        msg: "Unauthorized"
    });
});

router.get("/user", isAuthenticated, getUserController);

router.get("/setup", isAuthenticated, getSetupController);

router.get("/check", isAuthenticated, checkAuthController);

export default router;