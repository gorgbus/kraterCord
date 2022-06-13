import { Request, Response } from "express";
import Member from "../../database/schemas/Member";
import { User } from "../../database/schemas/User";
import { authLogin } from "../../services";
import { config } from "dotenv";
import Guild from "../../database/schemas/Guild";
import Channel, { channel } from "../../database/schemas/Channel";
import Notif from "../../database/schemas/Notif";
import jwt from "jsonwebtoken";
import Tokens from "../../database/schemas/Tokens";
import { encrypt } from "../../utils/crypto";
config();

const HOST = process.env.HOST;

interface tokenType extends Request {
    _user?: {
        token: string;
        username: string;
        avatar: string;
        discordId: string;
    };
}

const generateAccessToken = (user: any) => {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: "24h" });
}

export async function authLoginController(req: tokenType, res: Response) {
    const user = req._user;
    
    if (!user) return res.status(200).redirect(`${HOST}/noaccess`);

    try {
        const { data: _member } = await authLogin(user?.token!);

        if (_member.roles.includes("697507886326218902")) {
            const member = await Member.findOne({ discordId: user?.discordId });
            let savedMember;

            if (!member) {
                let avatar = user?.avatar;

                (avatar) ? avatar = `https://cdn.discordapp.com/avatars/${user?.discordId}/${avatar}.png` : avatar = "https://cdn.discordapp.com/attachments/805393975900110852/950026779484094494/ano-ne.gif";

                const newMember = new Member({ discordId: user?.discordId, username: user?.username, avatar, hash: user?.discordId.slice(user?.discordId.length - 4, user?.discordId.length), friends: [], friendRequests: [], status: "offline" });
                savedMember = await newMember.save();

                const memberNotifs = new Notif({ user: savedMember._id, notfis: [] });
                await memberNotifs.save();
            }

            const accessToken = generateAccessToken({ id: user?.discordId });
            const refreshToken = jwt.sign({ id: user?.discordId }, process.env.REFRESH_TOKEN_SECRET!);

            const tokens = await Tokens.findOne({ discordId: user?.discordId });

            if (!tokens) {
                const newTokens = new Tokens({ discordId: user?.discordId, accessToken: encrypt(accessToken), refreshToken: encrypt(refreshToken) });
                await newTokens.save();

                return res.redirect(`${HOST}/app?access=${accessToken}&refresh=${refreshToken}`);
            }

            await Tokens.updateOne({ discordId: user?.discordId }, { accessToken: encrypt(accessToken), refreshToken: encrypt(refreshToken) });

            return res.redirect(`${HOST}/app?access=${accessToken}&refresh=${refreshToken}`);
        } else {
            return res.status(200).redirect(`${HOST}/noaccess`);
        }
    } catch (err) {
        console.log(err);
        res.status(200).redirect(`${HOST}/noaccess`);
    }
}

export function checkAuthController(req: Request, res: Response) {
    const user = req.user as User;

    if (user) {
        res.status(200).send({ msg: "Authorized" });
    } else {
        res.status(200).send({ msg: "Unauthorized" });
    }
}

export async function getUserController(req: Request, res: Response) {
    const user = req.user as User;

    try {
        let member = await Member.findOne({ discordId: user.id });

        if (!member) return res.status(500).send({ msg: "User not found" });

        member = await member.populate("friends");
        member = await member.populate("friendRequests.friend");

        return res.status(200).send(member);
    } catch (err) {
        console.log(err);
        return res.status(500)
    }
}

export async function getSetupController(req: Request, res: Response) {
    const user = req.user as User;

    try {
        const guilds = await Guild.find();

        let member = await Member.findOne({ discordId: user.id });

        if (!member) return res.status(500).send({ msg: "User not found" });

        const dmChannels = await Channel.find({ type: "dm", users: { $in: [member] } });

        let popDMs: channel[] = [];

        for (const channel of dmChannels) {
            const _channel = await channel.populate("users");

            popDMs.push(_channel);
        }

        const guildChannels = await Channel.find({ guild: { $exists: true } });

        member = await member.populate("friends");
        member = await member.populate("friendRequests.friend");

        const notifs = await Notif.find({ user: member._id });

        const users = await Member.find();

        return res.status(200).send({ guilds, dms: popDMs, channels: guildChannels, member, notifs: notifs[0].notifs, users });
    } catch (err) {
        console.log(err);
        return res.status(500)
    }
}