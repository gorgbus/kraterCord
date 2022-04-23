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
const DOMAIN = process.env.DOMAIN;
const PROD = process.env.PROD === "production";

function createApp(): Express {
    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use(cors({
        origin: [HOST!],
        credentials: true,
    }));

    app.use(session({
        secret: process.env.SESSION_SECRET!,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 60000 * 60 * 24 * 7,
            domain: DOMAIN,
            secure: PROD
        },
        store: store.create({ mongoUrl: process.env.MONGOOSE })
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    app.use("/api", routes);

    return app;
}

export default createApp;