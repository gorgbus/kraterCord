import { config } from "dotenv";
import express, { Express } from "express";
import routes from "../routes";
import cors from "cors";
import passport from "passport";
import cookie from "cookie-parser";
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

    app.use(cookie());

    app.use("/api", routes);

    return app;
}

export default createApp;