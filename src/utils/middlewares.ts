import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import Tokens from "../database/schemas/Tokens";
import { decrypt } from "./crypto";

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (!req.cookies.JWT) return res.status(401).send({ msg: "Missing token" });

    let token = JSON.parse(req.cookies.JWT);

    token = token.access ? token.access : null;

    if (token == null) return res.status(401).send({ msg: "Missing token" });
    
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, async (err: any, user: any) => {
        if (err) return res.status(403).send({ msg: "Unauthorized" });

        const tokens = await Tokens.findOne({ discordId: user?.id });

        if (tokens && decrypt(tokens.accessToken) !== token) return res.status(403).send({ msg: "Unauthorized" });

        req.user = user;
        next();
    });
}