import { Request, Response } from "express";
import Guild from "../../database/schemas/Guild";

export async function geGuildsController(req: Request, res: Response) {
    try {
        const guilds = await Guild.find();

        return res.status(200).send(guilds);
    } catch (err) {
        console.log(err);
        return res.status(500);
    }
}