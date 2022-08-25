import { Server, Socket } from "socket.io";
import { prisma } from "../prisma";

interface ISocket extends Socket {
    user?: string;
}

const sockets = new Map<string, string[]>();

const socketIo = async (io: Server) => {
    io.on("connection", (s: ISocket) => {
        console.log(`Socket: ${s.id} has connected`);

        s.on("setup", async (id: string, user) => {
            s.join(id);
            s.join(`${id}-status`);

            s.user = id;

            const socket = sockets.get(id);

            if (socket) {
                sockets.set(id, [...socket, s.id]);
            } else {
                sockets.set(id, [s.id]);
            }
            
            s.broadcast.emit("online", user, s.id);
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
                        channelId: data.msg.channel
                    }
                },
                update: {
                    count: {
                        increment: 1
                    }
                },
                create: {
                    channel: { connect: { id: data.msg.channel } },
                    user: { connect: { id } },
                }
            });
        });

        s.on("create_message", async (data) => {
            s.broadcast.emit("new_message", data);

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
                        channelId: data.msg.channel
                    }
                },
                update: {
                    count: {
                        increment: 1
                    }
                },
                create: {
                    channel: { connect: { id: data.msg.channel } },
                    user: { connect: { id } },
                    guild: { connect: { id: data.guild } }
                }
            }));
        });

        s.on("create_notif", async (data, callback) => {
            const notif = {
                guild: data.guild,
                channel: data.channel,
                count: 1,
                createdOn: Date.now(),
            }

            const notification = await prisma.notification.upsert({
                where: {
                    userId_channelId: {
                        userId: data.user,
                        channelId: data.channel
                    }
                },
                update: {
                    count: {
                        increment: 1
                    }
                },
                create: {
                    channel: { connect: { id: data.channel } },
                    user: { connect: { id: data.user } },
                    guild: data.guild ? { connect: { id: data.guild } } : undefined
                }
            });

            if (notification) callback(notification);
        });

        s.on("notif_rm", async (channel, user) => {
            await prisma.notification.delete({
                where: {
                    userId_channelId: {
                        userId: user,
                        channelId: channel
                    }
                }
            });
        });

        s.on("con_user", async (userId, channelId, user) => {
            io.to(userId).emit("user_join_new", s.id, channelId, user);
        });

        s.on('update_voice_state', async (channel: string, user: string, muted: boolean, deafen: boolean, callback) => {
            try {
                const updatedUser = await prisma.user.update({
                    where: {
                        id: user
                    },
                    data: {
                        muted,
                        deafen
                    }
                });

                s.broadcast.emit('updated_voice_state', channel, user, muted, deafen);

                callback();
            } catch (err) {
                console.error(err);
            }
        });

        s.on("user_join", async (id: string, user: string) => {
            const isAlready = await prisma.channel.findUnique({
                where: {
                    id
                },
                include: {
                    users: { select: { id: true } }
                }
            });

            if (!isAlready) return console.log('Channel not found')

            if (isAlready?.users.find(usr => usr.id === user)) return console.log('Already in room');

            s.broadcast.emit("joined_channel", id, user);

            await s.join(id);

            try {
                await prisma.channel.update({
                    where: {
                        id
                    },
                    data: {
                        users: {
                            set: [...isAlready.users,  { id: user }]
                        }
                    }
                });
            } catch (err) {
                console.error(err);
            }

            s.on("disconnect", async () => {
                try {
                    const channelUsers = await prisma.channel.findUnique({
                        where: {
                            id
                        },
                        include: {
                            users: { select: { id: true } }
                        }
                    });

                    await prisma.channel.update({
                        where: {
                            id
                        },
                        data: {
                            users: {
                                set: channelUsers?.users.filter(usr => usr.id !== user)
                            }
                        }
                    });
                } catch (err) {
                    console.error(err);
                }
                
                s.broadcast.emit("user_disconnected", id, user);
            });
        });

        s.on("leave_channel", async (id, user) => {
            try {
                const channelUsers = await prisma.channel.findUnique({
                    where: {
                        id
                    },
                    include: {
                        users: { select: { id: true } }
                    }
                });

                await prisma.channel.update({
                    where: {
                        id
                    },
                    data: {
                        users: {
                            set: channelUsers?.users.filter(usr => usr.id !== user)
                        }
                    }
                });

                s.broadcast.emit("user_disconnected", id, user);
            } catch (err) {
                console.error(err);
            }
        });

        s.on("disconnect", async () => {
            if (!s.user) return;
            if (io.sockets.adapter.rooms.get(`${s.user}-status`)) return;

            const user = await prisma.user.update({
                where: {
                    id: s.user
                },
                data: {
                    status: 'OFFLINE'
                }
            });

            s.broadcast.emit("online", user);

            const socket = sockets.get(s.id);

            if (socket) {
                sockets.set(s.user, socket.filter((sc: string) => sc !== s.id));
            } else {
                sockets.delete(s.user);
            }

            console.log(`Socket: ${s.id} has disconnected`);
        });
    });
}

const emitToUser = (id: string, io: Server, event: string, ...args: any) => {
    const user = sockets.get(id);
    let users: string[] = [];

    if (user) {
        user.map((s) => {
            users.push(s);
        });

        io.to(users).emit(event, ...args);
    }
}

export default socketIo;