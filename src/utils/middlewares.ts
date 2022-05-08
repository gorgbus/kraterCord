import { NextFunction, Request, Response } from "express";

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => req.user ? next() : res.status(403).send({ msg: "Unauthorized" });

export const isAuthenticatedClient = (req: Request, res: Response, next: NextFunction) => req.headers.cookie ? next() : res.status(403).send({ msg: "Unauthorized" });