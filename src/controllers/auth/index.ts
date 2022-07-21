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

interface tokenType extends Request {
    _user?: {
        token: string;
        username: string;
        avatar: string;
        discordId: string;
        redir: string;
    };
}

const generateAccessToken = (user: any) => {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET!);
}

export async function authLoginController(req: tokenType, res: Response) {
    const user = req._user;
    
    if (!user) return res.status(200).redirect(`/status`);

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

            const access = generateAccessToken({ id: user?.discordId });
            const refresh = jwt.sign({ id: user?.discordId }, process.env.REFRESH_TOKEN_SECRET!);

            const tokens = await Tokens.findOne({ discordId: user?.discordId });

            if (!tokens) {
                const newTokens = new Tokens({ discordId: user?.discordId, accessToken: encrypt(access), refreshToken: encrypt(refresh) });
                await newTokens.save();

                return res.cookie("JWT", JSON.stringify({ access, refresh }), {
                    httpOnly: true,
                    secure: true,
                    sameSite: "none",
                    maxAge: 1000 * 60 * 60 * 24 * 7
                }).redirect(`${user.redir}app`);
            }

            await Tokens.updateOne({ discordId: user?.discordId }, { accessToken: encrypt(access), refreshToken: encrypt(refresh) });

            return res.cookie("JWT", JSON.stringify({ access, refresh }), {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                maxAge: 1000 * 60 * 60 * 24 * 7
            }).redirect(`${user.redir}app`);
        } else {
            return res.status(200).redirect(`${user.redir}noaccess`);
        }
    } catch (err) {
        console.log(err);
        res.status(200).redirect(`${user.redir}noaccess`);
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

        const dms = await Channel.find({ type: "dm", 'users.user': { $in: [member._id] } });

        const guildChannels = await Channel.find({ guild: { $exists: true } });

        member.status = "online";

        const notifs = await Notif.find({ user: member._id });

        const users = await Member.find();

        const token: string = req.cookies.JWT;

        return res.status(200).cookie("JWT", token, { httpOnly: true, secure: true, sameSite: "none", maxAge: 1000 * 60 * 60 * 24 * 7 }).send({ guilds, dms, channels: guildChannels, member, notifs: notifs[0].notifs, users });
    } catch (err) {
        console.log(err);
        return res.status(500)
    }
}