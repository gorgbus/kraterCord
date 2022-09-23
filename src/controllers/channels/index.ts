import { ChannelType } from "@prisma/client";
import { Request, Response } from "express";
import { prisma } from "../../prisma";

export const getChannelsController = async (req: Request, res: Response) => {
    const { guild } = req.params;

    if (!guild) return res.status(500);

    try {
        const channels = await prisma.channel.findMany({
            where: {
                guildId: guild
            },
            include: {
                members: true
            }
        });

        if (!channels) return res.status(500).send({ msg: 'Channels not found' });

        return res.status(200).send({ channels });
    } catch(err) {
        console.error(err);
        return res.status(500);
    }
}

export const getMessagesController = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { cursor } = req.query;
    
    if (!id || !cursor) return res.status(500);

    try {
        const take = 20;
        const cursorObj = cursor === 'first' ? undefined : { id: cursor as string };

        const messages = await prisma.message.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            where: {
                channelId: id
            },
            take,
            cursor: cursorObj,
            skip: cursor === 'first' ? 0 : 1,
            include: {
                author: true
            }
        });

        const nextId = messages.length === take ? messages[messages.length - 1].id : undefined;

        return res.status(200).send({ messages, nextId });
    } catch (err) {
        console.error(err);

        return res.status(500);
    }
}

export const createMessageController = async (req: Request, res: Response) => {
    const { id: authorId } = req.user as { id: string };
    const { id } = req.params;
    const { content } = req.body;

    if (!id) return res.status(500);

    try {
        const message = await prisma.message.create({
            data: {
                author: { connect: { id: authorId } },
                channel: { connect: { id } },
                content,
            }
        });

        if (!message) return res.status(500).send({ msg: 'Failed to create message' });

        return res.status(200).send({ message });
    } catch (err) {
        console.error(err);
        return res.status(500);
    }
}

export const createChannelController = async (req: Request, res: Response) => {
    const { type } = req.params;
    const { userIds, name, guild } = req.body;

    if (!type || !name) return res.status(500);

    try {
        const channel = await prisma.channel.create({
            data: {
                name,
                type: type as ChannelType,
                users: {
                    connect: userIds
                }
            },
            include: {
                users: true
            }
        });

        return res.status(200).send({ channel });
    } catch (err) {
        console.error(err);
        return res.status(500);
    }
}

export const joinChannelController = async (req: Request, res: Response) => {
    const { id: userId } = req.user as { id: string };
    const { id } = req.params;
    const { muted, deafen } = req.body;

    if (!userId || !id || typeof(muted) === 'undefined' || typeof(deafen) === 'undefined') return res.status(500);

    try {
        const user = await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                muted,
                deafen,
            }
        });

        if (!user) return res.status(500).send({ msg: 'User not found' });

        const channel = await prisma.channel.findUnique({
            where: {
                id
            },
            include: {
                members: { select: { id: true } }
            }
        });

        if (!channel) return res.status(500).send({ msg: 'Channel not found' });

        await prisma.channel.update({
            where: {
                id
            },
            data: {
                members: {
                    set: [...channel.members, { id: userId }]
                }
            }
        });

        return res.status(200).send({ channel });
    } catch (err) {
        console.error(err);
        return res.status(500);
    }
}

export const leaveChannelController = async (req: Request, res: Response) => {
    const { id: userId } = req.user as { id: string };
    const { id } = req.params;

    if (!userId || !id) return res.status(500);

    try {
        const channel = await prisma.channel.findUnique({
            where: {
                id
            },
            include: {
                members: { select: { id: true } }
            }
        });

        if (!channel) return res.status(500).send({ msg: 'Channel not found' });

        await prisma.channel.update({
            where: {
                id
            },
            data: {
                members: {
                    set: channel.members.filter(user => user.id !== userId)
                }
            }
        });

        return res.status(200).send({ channel });
    } catch (err) {
        console.error(err);
        return res.status(500);
    }
}