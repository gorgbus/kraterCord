import { Request, Response } from "express";
import { prisma } from "../../prisma";

export const friendReqController = async (req: Request, res: Response) => {
    const { username, hash, id } = req.body;

    if (!username || !hash || !id) return res.status(500).send({ msg: "Chybějící jméno, hash nebo id" });

    try {
        const user = await prisma.user.findUnique({
            where: {
                id
            },
            include: {
                incomingFriendReqs: { include: { requester: true } },
                outgoingFriendReqs: { include: { user: true } },
                friends: true
            }
        });

        if (!user) return res.status(500).send({ msg: 'User not found' });

        const isAlready = user.outgoingFriendReqs.find(friend => friend.user.hash === hash && friend.user.username === username);
        const isFriend = user.friends.find(friend => friend.hash === hash && friend.username === username);

        if (isAlready) return res.status(500).send({ msg: 'Already sent request' });
        if (isFriend) return res.status(500).send({ msg: 'Already your friend'});

        const hasRequested = user.incomingFriendReqs.find(friend => friend.requester.hash === hash && friend.requester.username === username);

        if (hasRequested) {
            await prisma.friendsRequest.delete({
                where: {
                    id: hasRequested.id
                }
            });

            const friendIds = user.friends.map(friend => ({ id: friend.id }));

            await prisma.user.update({
                where: {
                    id
                },
                data: {
                    friends: {
                        set: [...friendIds, { id: hasRequested.requesterId }]
                    }
                }
            });

            return res.status(200).send({ msg: 'Added as friend', friend: hasRequested.requester });
        }

        const friend = await prisma.user.findUnique({
            where: {
                username_hash: {
                    hash,
                    username
                }
            }
        });

        if (!friend) return res.status(500).send({ msg: "Friend not found" });
        
        await prisma.friendsRequest.create({
            data: {
                requester: { connect: { id: user.id } },
                user: { connect: { id: friend.id } }
            }
        })

        return res.status(200).send({ msg: `Friend request sent`, friend });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ msg: "Něco se nepovedlo" });
    }
}

export const friendDeclineController = async (req: Request, res: Response) => {
    const { id, friendId } = req.body;

    if (!id || !friendId) return res.status(500).send({ msg: "Chybějící id" });

    try {
        const req = await prisma.friendsRequest.delete({
            where: {
                userId_requesterId: {
                    requesterId: friendId,
                    userId: id
                }
            }
        });

        if (req) return res.status(200).send({ msg: "Success" });

        return res.status(203).send({ msg: "Request not found" });
    } catch (err) {
        console.error(err);
        return res.status(500);
    }
}

export const friendAcceptController = async (req: Request, res: Response) => {
    const { id, friendId } = req.body;

    if (!id || !friendId) return res.status(500);

    try {
        await prisma.friendsRequest.delete({
            where: {
                userId_requesterId: {
                    requesterId: friendId,
                    userId: id
                }
            }
        });

        const user = await prisma.user.findUnique({
            where: {
                id
            },
            include: {
                friends: { select: { id: true } }
            }
        });

        const friend = await prisma.user.findUnique({
            where: {
                id: friendId
            }
        })

        if (!user || !friend) return res.status(500).send({ msg: 'User/Friend not found' });

        await prisma.user.update({
            where: {
                id
            },
            data: {
                friends: {
                    set: [...user.friends, { id: friendId }]
                }
            }
        })

        return res.status(200).send({ friend });
    } catch (err) {
        console.error(err);
        return res.status(500);
    }
}

export const friendRemoveController = async (req: Request, res: Response) => {
    const { id, friendId } = req.body;

    if (!id || !friendId) return res.status(500);

    try {
        const user = await prisma.user.findUnique({
            where: {
                id
            },
            include: {
                friends: { select: { id } }
            }
        });

        if (!user) return res.status(500).send({ msg: 'User not found' });

        await prisma.user.update({
            where: {
                id
            },
            data: {
                friends: {
                    set: user.friends.filter(friend => friend.id !== friendId)
                }
            }
        })

        return res.status(200).send({ friendId });
    } catch (err) {
        console.error(err);
        return res.status(500);
    }
}

export const userUpdateController = async (req: Request, res: Response) => {
    const { avatar, username, id } = req.body;

    if (!id) return res.status(500);
    if (!avatar && !username) return res.status(500);

    try {
        const update = (avatar && username) ? { avatar, username } : avatar ? { avatar } : { username };

        const user = await prisma.user.update({
            where: {
                id
            },
            data: update
        })

        if (!user) return res.status(500);

        return res.status(200).send({ user });
    } catch (err) {
        console.error(err);
        return res.status(500);
    }
}