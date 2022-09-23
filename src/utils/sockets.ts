import e from "express";
import { Server, Socket } from "socket.io";
import { prisma } from "../prisma";

interface ISocket extends Socket {
    user?: string;
}

const sockets = new Map<string, string[]>();
const guildSockets = new Map<string, string[]>();

const socketIo = async (io: Server) => {
    io.on("connection", (s: ISocket) => {
        console.log(`Socket: ${s.id} has connected`);

        s.on("setup", async (id: string, guilds: string[]) => {
            s.join(id);
            s.join(`${id}-status`);

            s.user = id;

            const socket = sockets.get(id);

            guilds.forEach((g) => {
                const guild = guildSockets.get(g);

                if (guild) {
                    guildSockets.set(g, [...guild, s.id]);
                } else {
                    guildSockets.set(g, [s.id]);
                }
            });

            if (socket) {
                sockets.set(id, [...socket, s.id]);
            } else {
                sockets.set(id, [s.id]);

                const user = await prisma.user.update({
                    where: {
                        id
                    },
                    data: {
                        status: "ONLINE"
                    }
                });

                s.broadcast.emit("online", user, s.id);
            }
        });

        s.on("status", (user, id: string) => {
            io.to(id).emit("online", user);
        });

        s.on("update_user", async (user) => {
            const updatedUser = await prisma.user.update({
                where: {
                    id: user.id
                },
                data: user
            });
            
            s.broadcast.emit("online", updatedUser);
        });

        s.on("friend", (type, id, friendId) => {
            emitToUser(friendId, io, 'friend-client', type, id);
        });

        s.on("dm_create", (_id, dm) => {
            s.join(_id);
            s.to(_id).emit("dm_created", (dm));
            s.leave(_id);
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
            if (io.sockets.adapter.rooms.get(`${s.user}-status`)) return;

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

            console.log(`Socket: ${s.id} has disconnected`);
        });
    });
}

const emitToUser = (id: string, io: Server, event: string, ...args: any) => {
    const user = sockets.get(id);
    let users: string[] = [];

    if (user) {
        user.forEach((s) => {
            users.push(s);
        });

        io.to(users).emit(event, ...args);
    }
}

const emitToGuild = (id: string, io: Server, event: string, ...args: any) => {
    const guild = guildSockets.get(id);
    let users: string[] = [];

    if (guild) {
        guild.forEach((s) => {
            users.push(s);
        });

        io.to(users).emit(event, ...args);
    }
}

const removeSocketFromGuilds = (id: string) => {
    guildSockets.forEach((value, key) => {
        guildSockets.set(key, value.filter((sc: string) => sc !== id));
    });
}

export default socketIo;