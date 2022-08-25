import { ChannelType } from "@prisma/client";
import { Request, Response } from "express";
import { prisma } from "../../prisma";

export async function geChannelsController(req: Request, res: Response) {
    const { guild } = req.params;

    if (!guild) return res.status(500);

    try {
        const channels = await prisma.channel.findMany({
            where: {
                guildId: guild
            },
            include: {
                users: true
            }
        });

        if (!channels) return res.status(500).send({ msg: 'Channels not found' });

        return res.status(200).send(channels);
    } catch(err) {
        console.error(err);
        return res.status(500);
    }
}

export async function getMessagesController(req: Request, res: Response) {
    const { id } = req.params;
    const { cursor } = req.query;
    
    if (!id || !cursor) return res.send(500);

    try {
        const take = 20;
        const cursorObj = cursor === '' ? undefined : { id: cursor as string };

        const messages = await prisma.message.findMany({
            where: {
                channelId: id
            },
            take,
            cursor: cursorObj,
            skip: cursor === '' ? 0 : 1
        });

        const nextId = messages.length === take ? messages[messages.length - 1].id : undefined;

        return res.status(200).send({ messages, nextId });
    } catch (err) {
        console.error(err);
        return res.status(200).send({ messages: [], nextId: 0 });
    }
}

export async function createMessageController(req: Request, res: Response) {
    const { id } = req.params;
    const { content, media, author } = req.body;

    if (!id || !author) return res.status(500);

    try {
        const message = await prisma.message.create({
            data: {
                author: { connect: { id: author } },
                channel: { connect: { id } },
                content,
            }
        });

        return res.status(200).send(message);
    } catch (err) {
        console.error(err);
        return res.status(500);
    }
}

export async function createChannelController(req: Request, res: Response) {
    const { type } = req.params;
    const { user, name, guild } = req.body;

    if (!type || !name) return res.status(500);

    try {
        const channel = await prisma.channel.create({
            data: {
                name,
                type: type as ChannelType,
                users: {
                    connect: user.map((usr: string) => { id: usr })
                }
            }
        });

        return res.status(200).send(channel);
    } catch (err) {
        console.error(err);
        return res.status(500);
    }
}