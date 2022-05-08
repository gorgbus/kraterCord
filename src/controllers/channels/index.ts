import { Request, Response } from "express";
import Channel, { channel } from "../../database/schemas/Channel";
import Member, { member } from "../../database/schemas/Member";
import Message, { message } from "../../database/schemas/Message";
import { User } from "../../database/schemas/User";

export async function geChannelsController(req: Request, res: Response) {
    const { guild } = req.params;

    if (!guild) return res.status(500);

    try {
        const channels = await Channel.find({ guild });

        let popChannels: channel[] = [];

        for (const channel of channels) {
            const _channel = await channel.populate("users");

            popChannels.push(_channel);
        }

        return res.status(200).send(popChannels);
    } catch(err) {
        console.log(err);
        return res.status(500);
    }
    
}

export async function getDMController(req: Request, res: Response) {
    const user = req.user as User;

    try {
        const member = await Member.findOne({ discordId: user.discordId });

        if (!member) return res.status(500).send({ msg: "User not found" });

        const dmChannels = await Channel.find({ type: "dm", users: { $in: [member] } });

        let popChannels: channel[] = [];

        for (const channel of dmChannels) {
            const _channel = await channel.populate("users");

            popChannels.push(_channel);
        }

        return res.status(200).send(popChannels);
    } catch(err) {
        console.log(err);
        return res.status(500);
    }
}

export async function getMessagesController(req: Request, res: Response) {
    const { id } = req.params;
    const { _skip, _limit } = req.query;
    
    if (!id || !_skip || !_limit) return res.send(500);

    try {
        const count = await Message.countDocuments({ channel: { $in: [id] } });
        const messages = await Message.find({ channel: { $in: [id] } }).sort({ createdAt: "desc" }).skip(Number(_skip)).limit(Number(_limit));

        let popMessages: message[] = [];

        for (const msg of messages) {
            const popMessage = await msg.populate("author");
            popMessages.push(popMessage);
        }

        const nextId = count % Number(_limit) === 0 ? Math.floor(count / Number(_limit)) : Math.floor(count / Number(_limit)) + 1;

        return res.status(200).send({ messages: popMessages, nextId });
    } catch (err) {
        console.log(err);
        return res.status(200).send({ messages: [], nextId: 0 });
    }
}

export async function createMessageController(req: Request, res: Response) {
    const { id } = req.params;
    const { content, media, author } = req.body;

    if (!id || !author) return res.status(500);

    try {
        let message = {
            author,
            content,
            media,
            channel: id
        }

        const msg = await Message.create(message);

        const popMsg = await msg.populate("author");

        return res.status(200).send(popMsg);
    } catch (err) {
        console.log(err);
        return res.status(500);
    }
}

export async function createChannelController(req: Request, res: Response) {
    const { type } = req.params;
    const { users } = req.body;

    if (!type) return res.status(500);

    try {
        let members: member[] = [];

        if (type === "dm") {
            for (const id of users) {
                const user = await Member.findById(id);

                if (!user) return res.status(500);

                members.push(user);
            }
        } else return res.status(500);

        let channel = {
            name: " ",
            type,
            users: members,
        }

        let ch = await Channel.findOne({ type, users: { $in: members } });

        if (!ch) {
            ch = await Channel.create(channel);
        }

        const popCh = await ch.populate("users");

        return res.status(200).send(popCh);
    } catch (err) {
        console.log(err);
        return res.status(500);
    }
}