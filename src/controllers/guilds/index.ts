import { Request, Response } from "express";
import { prisma } from "../../prisma";

export async function geGuildsController(req: Request, res: Response) {
    try {
        const guilds = await prisma.guild.findMany({
            include: {
                channels: true,
                members: true,
                notifications: true,
                owner: true
            }
        });

        return res.status(200).send(guilds);
    } catch (err) {
        console.error(err);
        return res.status(500);
    }
}