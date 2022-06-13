import { config } from "dotenv";
import express, { Express } from "express";
import routes from "../routes";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import store from "connect-mongo";
config();

require("../strategies/discord");

const HOST = process.env.HOST;

function createApp(): Express {
    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use(cors({
        origin: [HOST!],
        credentials: true
    }));

    app.use(passport.initialize());

    app.set("trust proxy", 1);

    app.use("/api", routes);

    return app;
}

export default createApp;