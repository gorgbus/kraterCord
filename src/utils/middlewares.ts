import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import Tokens from "../database/schemas/Tokens";
import { decrypt } from "./crypto";

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token == null) return res.status(401).send({ msg: "Missing token" });
    
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, async (err, user: any) => {
        if (err) return res.status(403).send({ msg: "Unauthorized" });

        const tokens = await Tokens.findOne({ discordId: user?.id });

        if (tokens && decrypt(tokens.accessToken) !== token) return res.status(403).send({ msg: "Unauthorized" });

        req.user = user;
        next();
    });
}