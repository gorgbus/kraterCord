import { Request, response, Response } from "express";
import Member from "../../database/schemas/Member";

export const friendReqController = async (req: Request, res: Response) => {
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

export const friendDeclineController = async (req: Request, res: Response) => {
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

export const friendAcceptController = async (req: Request, res: Response) => {
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

export const friendRemoveController = async (req: Request, res: Response) => {
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

export const userUpdateController = async (req: Request, res: Response) => {
    const { avatar, username, id } = req.body;

    if (!id) return res.status(500);
    if (!avatar && !username) return res.status(500);

    try {
        const update = (avatar && username) ? { avatar, username } : avatar ? { avatar } : { username };

        const updatedUser = await Member.findByIdAndUpdate(id, update, { new: true });

        if (!updatedUser) return res.status(500);

        updatedUser.status = 'online';

        return res.status(200).send({ user: updatedUser });
    } catch (err) {
        console.log(err);
        return res.status(500);
    }
}