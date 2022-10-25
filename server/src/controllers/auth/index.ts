import { Request, Response } from "express";
import { authLogin } from "../../services";
import { config } from "dotenv";
import jwt from "jsonwebtoken";
import { decrypt, encrypt } from "../../utils/crypto";
import { prisma } from "../../prisma";
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

export const authLoginController = async (req: tokenType, res: Response) => {
    const user = req._user;
    
    if (!user) return res.status(200).redirect(`/status`);

    try {
        const { data: _member } = await authLogin(user?.token!);

        if (_member.roles.includes("697507886326218902")) {
            const member = await prisma.user.findUnique({
                where: {
                    discordId: user.discordId
                }
            });

            let newMember;

            if (!member) {
                let avatar = user?.avatar;

                (avatar) ? avatar = `https://cdn.discordapp.com/avatars/${user?.discordId}/${avatar}.png` : avatar = "https://cdn.discordapp.com/attachments/805393975900110852/950026779484094494/ano-ne.gif";

                newMember = await prisma.user.create({
                    data: {
                        discordId: user.discordId,
                        username: user.username,
                        avatar,
                        hash: user?.discordId.slice(user?.discordId.length - 4, user?.discordId.length),
                        status: 'OFFLINE'
                    }
                });
            }

            const tokens = await prisma.token.findUnique({
                where: {
                    discordId: user.discordId,
                }
            });

            if (!tokens) {
                const access = generateAccessToken({ discordId: user?.discordId, id: member ? member.id : newMember?.id });
                const refresh = jwt.sign({ discordId: user?.discordId, id: member ? member.id : newMember?.id }, process.env.REFRESH_TOKEN_SECRET!);

                await prisma.token.create({
                    data: {
                        discordId: user.discordId,
                        accessToken: encrypt(access),
                        refreshToken: encrypt(refresh)
                    }
                })

                return res.cookie("JWT", JSON.stringify({ access, refresh }), {
                    httpOnly: true,
                    secure: true,
                    sameSite: "none",
                    maxAge: 1000 * 60 * 60 * 24 * 7
                }).redirect(`${user.redir}app`);
            }

            return res.cookie("JWT", JSON.stringify({ access: decrypt(tokens.accessToken), refresh: decrypt(tokens.refreshToken) }), {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                maxAge: 1000 * 60 * 60 * 24 * 7
            }).redirect(`${user.redir}app`);
        } else {
            return res.status(200).redirect(`${user.redir}noaccess`);
        }
    } catch (err) {
        console.error(err);
        res.status(200).redirect(`${user.redir}noaccess`);
    }
}

export const getSetupController = async (req: Request, res: Response) => {
    const { id } = req.user as { id: string };

    try {
        const user = await prisma.user.findUnique({
            where: {
                id
            },
            include: {
                guilds: true,
                dms: { include: { users: true } },
                friends: true,
                incomingFriendReqs: { include: { requester: true } },
                outgoingFriendReqs: { include: { user: true } },
                notifications: true,
                members: { include: { user: true, channels: true } }
            }
        });

        if (!user) return res.status(500).send({ msg: "User not found" });

        const token: string = req.cookies.JWT;

        return res.status(200).cookie("JWT", token, { httpOnly: true, secure: true, sameSite: "none", maxAge: 1000 * 60 * 60 * 24 * 7 }).send({ user });
    } catch (err) {
        console.error(err);
        return res.status(500)
    }
}

export const logoutController = async (_req: Request, res: Response) => {
    // const user = req.user;

    try {
        return res.status(200).clearCookie('JWT').send({ msg: 'Successfully loged out' });
    } catch (err) {
        console.error(err);

        return res.status(500);
    }
}