import { Router } from "express";
import authRouter from "./auth";
import channelRouter from "./channels";
import uploadRouter from "./upload";
import guildRouter from "./guilds";
import userRouter from "./user";

const router = Router();

router.use("/auth", authRouter);

router.use("/channels", channelRouter);

router.use("/upload", uploadRouter);

router.use("/guilds", guildRouter);

router.use("/user", userRouter);

export default router;