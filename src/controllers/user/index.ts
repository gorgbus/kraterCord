import { Request, response, Response } from "express";
import Member from "../../database/schemas/Member";

export async function friendReqController (req: Request, res: Response) {
    const { username, hash, id } = req.body;

    if (!username || !hash || !id) return res.status(500).send({ msg: "Chybějící jméno, hash nebo id" });

    try {
        const user = await Member.findById(id);

        const isAlready = await Member.findOne({ username, hash, friendRequests: { $in: { friend: id } } });
        const isFriend = await Member.findOne({ username, hash, friends: { $in: [id] } });

        if (isAlready) return res.status(500).send({ msg: `Už jsi poslal žádost o přátelství uživateli ${username}#${hash}` });
        if (isFriend) return res.status(500).send({ msg: `${username}#${hash} už je tvůj přítel`});

        const friend = await Member.findOneAndUpdate({ username, hash }, { $push: { friendRequests: { friend: id, type: "in" } } }, { new: true });
        
        if (user && friend) {
            await user.updateOne({ $push: { friendRequests: { friend: friend._id, type: "out" } } });

            return res.status(200).send({ msg: `Žádost o přátelství byla poslána uživateli ${username}#${hash}`, friend });
        }

        return res.status(500).send({ msg: "Uživatel nebyl nalezen" });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ msg: "Něco se nepovedlo" });
    }
}

export async function friendDeclineController (req: Request, res: Response) {
    const { id, friendId } = req.body;

    if (!id || !friendId) return res.status(500).send({ msg: "Chybějící id" });

    try {
        const friend = await Member.findById(friendId);

        const user = await Member.findByIdAndUpdate(id, { $pull: { friendRequests: { friend: friendId } } }, { new: true });

        if (user && friend) {
            await friend.updateOne({ $pull: { friendRequests: { friend: id } } });

            return res.status(200).send({ msg: "Success" });
        }

        return res.status(203).send({ msg: "User not found" });
    } catch (err) {
        console.log(err);
        return res.status(500);
    }
}

export async function friendAcceptController (req: Request, res: Response) {
    const { id, friendId } = req.body;

    if (!id || !friendId) return res.status(500);

    try {
        const friend = await Member.findById(friendId);
        const user = await Member.findByIdAndUpdate(id, { $pull: { friendRequests: { friend: friendId } } }, { new: true });

        if (user && friend) {
            await friend.updateOne({ $pull: { friendRequests: { friend: id } } });

            await user.updateOne({ $push: { friends: friend._id } });
            await friend.updateOne({ $push: { friends: user._id } }, { new: true });

            return res.status(200).send(friend);
        }

        return res.status(203).send({ msg: "User not found" });
    } catch (err) {
        console.log(err);
        return res.status(500);
    }
}

export async function friendRemoveController (req: Request, res: Response) {
    const { id, friendId } = req.body;

    if (!id || !friendId) return res.status(500);

    try {
        const friend = await Member.findById(friendId);
        const user = await Member.findByIdAndUpdate(id, { $pull: { friends: friendId } }, { new: true });

        if (user && friend) {
            await friend.updateOne({ $pull: { friends: id } }, { new: true });

            return res.status(200).send(friend);
        }

        return res.status(203).send({ msg: "User not found" });
    } catch (err) {
        console.log(err);
        return res.status(500);
    }
}