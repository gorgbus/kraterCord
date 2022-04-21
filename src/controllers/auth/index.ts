import { Request, Response } from "express";
import Member from "../../database/schemas/Member";
import { User } from "../../database/schemas/User";
import { authLogin } from "../../services";
import { config } from "dotenv";
config();

const HOST = process.env.HOST;

export async function authLoginController(req: Request, res: Response) {
    const user = req.user as User;

    try {
        const { data: member } = await authLogin(user.id);

        if (member.roles.includes("697507886326218902")) {
            res.redirect(`${HOST}/channels/@me`);
        } else {
            req.session.destroy(err => {
                res.clearCookie('connect.sid', {path: '/'}).status(200).redirect(`${HOST}/noaccess`);
            });
        }
    } catch (err) {
        console.log(err);
        req.session.destroy(err => {
            res.clearCookie('connect.sid', {path: '/'}).status(200).redirect(`${HOST}/noaccess`);
        });
    }
}

export async function getUserController(req: Request, res: Response) {
    const user = req.user as User;

    try {
        let member = await Member.findOne({ discordId: user.discordId });

        if (!member) return res.status(500).send({ msg: "User not found" });

        member = await member.populate("friends");
        member = await member.populate("friendRequests.friend");

        return res.status(200).send(member);
    } catch (err) {
        console.log(err);
        return res.status(500)
    }
}