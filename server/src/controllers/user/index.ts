import { Request, Response } from "express";
import { prisma } from "../../prisma";

export const friendReqController = async (req: Request, res: Response) => {
    const { id } = req.user as { id: string };
    const { username, hash } = req.body;

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
            const request = await prisma.friendsRequest.delete({
                where: {
                    id: hasRequested.id
                }
            });

            const friendIds = user.friends.map(friend => ({ id: friend.id }));

            const updatedUser = await prisma.user.update({
                where: {
                    id
                },
                data: {
                    friends: {
                        set: [...friendIds, { id: hasRequested.requesterId }]
                    }
                }
            });

            return res.status(200).send({ msg: 'Added as friend', user: updatedUser, friend: hasRequested.requester, requestId: request.id });
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
        
        const request = await prisma.friendsRequest.create({
            data: {
                requester: { connect: { id: user.id } },
                user: { connect: { id: friend.id } }
            },
            include: {
                requester: true,
                user: true
            }
        })

        return res.status(200).send({ msg: `Friend request sent`, request });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ msg: "Něco se nepovedlo" });
    }
}

export const friendDeclineController = async (req: Request, res: Response) => {
    const { id } = req.body;

    if (!id) return res.status(500).send({ msg: "Chybějící id" });

    try {
        const request = await prisma.friendsRequest.delete({
            where: {
                id
            }
        });

        if (request) return res.status(200).send({ msg: "Success", requestId: request.id });

        return res.status(203).send({ msg: "Request not found" });
    } catch (err) {
        console.error(err);
        return res.status(500);
    }
}

export const friendAcceptController = async (req: Request, res: Response) => {
    const { id: userId } = req.user as { id: string };
    const { requestId, friendId } = req.body;

    if (!requestId || !userId || !friendId) return res.status(500);

    try {
        const request = await prisma.friendsRequest.delete({
            where: {
                id: requestId
            }
        });

        const user = await prisma.user.findUnique({
            where: {
                id: userId
            },
            include: {
                friends: { select: { id: true } }
            }
        });

        const friend = await prisma.user.findUnique({
            where: {
                id: friendId
            },
            include: {
                friends: { select: { id: true } }
            }
        })

        if (!user || !friend) return res.status(500).send({ msg: 'User/Friend not found' });

        const updatedUser = await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                friends: {
                    set: [...user.friends, { id: friendId }]
                }
            }
        });

        await prisma.user.update({
            where: {
                id: friendId
            },
            data: {
                friends: {
                    set: [...friend.friends, { id: userId }]
                }
            }
        });

        return res.status(200).send({ friend, user: updatedUser, requestId: request.id });
    } catch (err) {
        console.error(err);
        return res.status(500);
    }
}

export const friendRemoveController = async (req: Request, res: Response) => {
    const { id: userId } = req.user as { id: string };
    const { friendId } = req.body;

    if (!userId || !friendId) return res.status(500);

    try {
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            },
            include: {
                friends: { select: { id: true } }
            }
        });

        if (!user) return res.status(500).send({ msg: 'User not found' });

        const friend = await prisma.user.findUnique({
            where: {
                id: friendId
            },
            include: {
                friends: { select: { id: true } }
            }
        });

        if (!friend) return res.status(500).send({ msg: 'Friend not found' });

        await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                friends: {
                    set: user.friends.filter(friend => friend.id !== friendId)
                }
            }
        });

        await prisma.user.update({
            where: {
                id: friendId
            },
            data: {
                friends: {
                    set: friend.friends.filter(friend => friend.id !== userId)
                }
            }
        });

        return res.status(200).send({ friendId });
    } catch (err) {
        console.error(err);
        return res.status(500);
    }
}

export const userUpdateController = async (req: Request, res: Response) => {
    const { id } = req.user as { id: string };
    const { update } = req.body;

    if (!id) return res.status(500);
    if (!update) return res.status(500);

    try {
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

export const userCreateNotificationController = async (req: Request, res: Response) => {
    const { id } = req.user as { id: string };
    const { channelId, guildId } = req.body;

    if (!id || !channelId) return res.status(500);

    try {
        const notification = await prisma.notification.upsert({
            where: {
                userId_channelId: {
                    userId: id,
                    channelId
                }
            },
            update: {
                count: {
                    increment: 1
                }
            },
            create: {
                user: { connect: { id } },
                channel: { connect: { id: channelId } },
                guild: guildId ? { connect: { id: guildId } } : undefined
            }
        });

        if (!notification) return res.status(500).send({ msg: 'Failed to create notification' });

        return res.status(200).send({ notification });
    } catch (err) {
        console.error(err);
        return res.status(500);
    }
}

export const userDeleteNotificationController = async (req: Request, res: Response) => {
    const { id } = req.user as { id: string };
    const { notificationId } = req.params;

    if (!id || !notificationId) return res.status(500);

    try {
        const notification = await prisma.notification.delete({
            where: {
                id: notificationId
            }
        });

        if (!notification) return res.status(500).send({ msg: 'Failed to delete notification' });

        return res.status(200).send({ notificationId: notification.id });
    } catch (err) {
        console.error(err);
        return res.status(500);
    }
}