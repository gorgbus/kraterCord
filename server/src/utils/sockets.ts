import { Server, Socket } from "socket.io";
import { prisma } from "../prisma";
import cookie from "cookie";
import jwt from "jsonwebtoken";
import { decrypt } from "./crypto";

interface ISocket extends Socket {
    user?: string;
}

const sockets = new Map<string, string[]>();
const guildSockets = new Map<string, string[]>();

const socketIo = async (io: Server, serverIo: Server) => {
    io.on("connection", (s: ISocket) => {
        if (!s.handshake.headers.cookie) return s.disconnect(true);

        const cookies = cookie.parse(s.handshake.headers.cookie);

        if (!cookies.JWT) return s.disconnect(true);

        let token = JSON.parse(cookies.JWT);

        token = token.access ? token.access : null;

        if (token === null) return s.disconnect(true);

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, async (err: any, user: any) => {
            if (err) return s.disconnect(true);

            try {
                const tokens = await prisma.token.findUnique({
                    where: {
                        discordId: user.discordId
                    }
                });

                if (!tokens) return s.disconnect(true);

                if (decrypt(tokens.accessToken) !== token) return s.disconnect(true);

                console.log(`[${new Date(Date.now()).toLocaleTimeString()}] user: \x1b[33m${user.id}\x1b[0m connected with socket: \x1b[31m${s.id}\x1b[0m`);

                s.user = user.id;

                const socket = sockets.get(user.id);

                if (socket) {
                    sockets.set(user.id, [...socket, s.id]);
                } else {
                    sockets.set(user.id, [s.id]);

                    await prisma.user.update({
                        where: {
                            id: user.id
                        },
                        data: {
                            status: "ONLINE"
                        }
                    });
                }
            } catch (err) {
                console.error(err);

                return s.disconnect(true);
            }
        });

        s.on("setup", async (guilds: string[]) => {
            guilds.forEach((g) => {
                const guild = guildSockets.get(g);

                if (guild) {
                    guildSockets.set(g, [...guild, s.id]);
                } else {
                    guildSockets.set(g, [s.id]);
                }
            });
        });

        s.on("update", (type: string, updateData) => {
            switch(type) {
                case "member": {
                    emitToGuild(updateData.guildId, io, "update_client", "member", updateData);

                    break;
                }

                case "user": {
                    emitToUserGuilds(s.id, io, "update_client", "user", updateData);

                    break;
                }

                case "friend": {
                    emitToUsers(updateData.friendIds, io, "update_client", "friend", updateData);

                    break;
                }
            }
        });

        // s.on("status", (user, id: string) => {
        //     io.to(id).emit("online", user);
        // });

        // s.on("update_user", async (user) => {
        //     const updatedUser = await prisma.user.update({
        //         where: {
        //             id: user.id
        //         },
        //         data: user
        //     });
            
        //     s.broadcast.emit("online", updatedUser);
        // });

        s.on("friend", (type, friendId, data) => {
            emitToUser(friendId, io, 'friend_client', type, data);
        });

        s.on("create_message_dm", async (id, data) => {
            emitToUser(id, io, 'new_message', data);

            if (sockets.has(id)) return;

            await prisma.notification.upsert({
                where: {
                    userId_channelId: {
                        userId: id,
                        channelId: data.id
                    }
                },
                update: {
                    count: {
                        increment: 1
                    }
                },
                create: {
                    channel: { connect: { id: data.id } },
                    user: { connect: { id } },
                }
            });
        });

        s.on("create_message", async (data) => {
            emitToGuild(data.guild, io, 'new_message', data);

            const online = Array.from(sockets.keys());

            const offline = await prisma.user.findMany({
                where: {
                    id: {
                        notIn: online
                    }
                },
                select: {
                    id: true
                }
            });

            const offlineIds = offline.map(user => (user.id));

            offlineIds.map(id => prisma.notification.upsert({
                where: {
                    userId_channelId: {
                        userId: id,
                        channelId: data.id
                    }
                },
                update: {
                    count: {
                        increment: 1
                    }
                },
                create: {
                    channel: { connect: { id: data.id } },
                    user: { connect: { id } },
                    guild: { connect: { id: data.guild } }
                }
            }));
        });

        s.on("con_user", async (userId, channelId, user) => {
            io.to(userId).emit("user_join_new", s.id, channelId, user);
        });

        s.on('update_voice_state', async (voiceGuild: string, channelId: string, userId: string, muted: boolean, deafen: boolean) => {
            emitToGuild(voiceGuild, io, 'updated_voice_state', voiceGuild, channelId, userId, muted, deafen);
        });

        s.on("user_join", async (data) => {
            const isAlready = await prisma.channel.findUnique({
                where: {
                    id: data.channel
                },
                include: {
                    users: { select: { id: true } }
                }
            });

            if (!isAlready) return console.log('Channel not found')

            if (isAlready?.users.find(usr => usr.id === data.user.id)) return console.log('Already in room');

            emitToGuild(data.voiceGuild, io, "joined_channel", data);

            await s.join(data.channel);

            s.on("disconnect", async () => {
                try {
                    const channelUsers = await prisma.channel.findUnique({
                        where: {
                            id: data.channel
                        },
                        include: {
                            users: { select: { id: true } }
                        }
                    });

                    await prisma.channel.update({
                        where: {
                            id: data.channel
                        },
                        data: {
                            users: {
                                set: channelUsers?.users.filter(usr => usr.id !== data.user.id)
                            }
                        }
                    });
                } catch (err) {
                    console.error(err);
                }
                
                emitToGuild(data.voiceGuild, io, 'user_disconnected', data.voiceGuild, data.channel, data.user.id);
            });
        });

        s.on("leave_channel", async (voiceGuild, channel, user) => {
            emitToGuild(voiceGuild, io, 'user_disconnected', voiceGuild, channel, user);
        });

        s.on("disconnect", async () => {
            if (!s.user) return;

            removeSocketFromGuilds(s.id);

            const socket = sockets.get(s.id);

            if (socket) {
                sockets.set(s.user, socket.filter((sc: string) => sc !== s.id));
            } else {
                sockets.delete(s.user);

                const user = await prisma.user.update({
                    where: {
                        id: s.user
                    },
                    data: {
                        status: 'OFFLINE'
                    }
                });

                s.broadcast.emit("online", user);
            }

            console.log(`[${new Date(Date.now()).toLocaleTimeString()}] user: \x1b[33m${s.user}\x1b[0m with socket: \x1b[31m${s.id}\x1b[0m has disconnected`);
        });
    });

    serverIo.on("connection", (s) => {
        s.on("user_left", async (userId: string, channelId: string) => {
            try {
                const members = await prisma.channel.findUnique({
                    where: {
                        id: channelId
                    },
                    select: {
                        members: true
                    }
                });

                if (!members) return;

                await prisma.channel.update({
                    where: {
                        id: channelId
                    },
                    data: {
                        members: {
                            set: members.members.filter(member => member.userId === userId)
                        }
                    }
                });
            } catch (err) {
                console.error(err);
            }
        });
    });
}

const emitToUser = (userId: string, io: Server, event: string, ...args: any) => {
    const user = sockets.get(userId);
    const users: string[] = [];

    if (user) {
        user.forEach((s) => {
            users.push(s);
        });

        io.to(users).emit(event, ...args);
    }
}

const emitToUsers = (userIds: string[], io: Server, event: string, ...args: any) => {
    const users: string[] = [];
    const socketsIds = [...sockets];
    const userSockets = socketsIds.filter(([id]) => userIds.some((userId) => userId === id));

    userSockets.forEach(([, socket]) => {
        socket.forEach((s) => {
            users.push(s);
        });
    });

    io.to(users).emit(event, ...args);
}

const emitToGuild = (guildId: string, io: Server, event: string, ...args: any) => {
    const guild = guildSockets.get(guildId);
    let users: string[] = [];

    if (guild) {
        guild.forEach((s) => {
            users.push(s);
        });

        io.to(users).emit(event, ...args);
    }
}

const emitToUserGuilds = (socketId: string, io: Server, event: string, ...args: any) => {
    const userGuilds = [...guildSockets];
    const guilds = userGuilds.filter(([_, arr]) => arr.includes(socketId));
    const users: string[] = [];

    guilds.forEach(([, arr]) => {
        arr.forEach((s) => {
            users.push(s);
        });
    });

    io.to(users).emit(event, ...args);
}

const removeSocketFromGuilds = (id: string) => {
    guildSockets.forEach((value, key) => {
        guildSockets.set(key, value.filter((sc: string) => sc !== id));
    });
}

export default socketIo;