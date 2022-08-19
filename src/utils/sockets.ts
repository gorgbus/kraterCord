import { Server, Socket } from "socket.io";
import Channel from "../database/schemas/Channel";
import Member, { member } from "../database/schemas/Member";
import Notif from "../database/schemas/Notif";
import mongoose from "mongoose";

interface ISocket extends Socket {
    user?: string;
}

const sockets = new Map<string, string[]>();

const socketIo = async (io: Server) => {
    io.on("connection", (s: ISocket) => {
        console.log(`Socket: ${s.id} has connected`);

        s.on("setup", async (id: string, user: member) => {
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

        s.on("status", (user: member, id: string) => {
            io.to(id).emit("online", user);
        });

        s.on("update_user", async (user: member) => {
            const _user = await Member.findByIdAndUpdate(user._id, user, { new: true });
            s.broadcast.emit("online", _user);
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

            let online: mongoose.Types.ObjectId[] = [];

            for (const user of sockets.keys()) {
                const objId = new mongoose.Types.ObjectId(user);
                online.push(objId);
            }

            const notif = {
                guild: data.guild,
                channel: data.msg.channel,
                createdOn: Date.now(),
            }

            await Notif.updateMany({ user: { $nin: online }, 'notifs.channel': data.msg.channel }, { $inc: { 'notifs.$.count': 1 }});
            await Notif.updateMany({ user: { $nin: online }, 'notifs.channel': { $nin: [data.id] } }, { $push: { notifs: notif } });
        });

        s.on("create_message", async (data) => {
            s.broadcast.emit("new_message", data);

            let online: mongoose.Types.ObjectId[] = [];

            for (const user of sockets.keys()) {
                const objId = new mongoose.Types.ObjectId(user);
                online.push(objId);
            }

            const notif = {
                guild: data.guild,
                channel: data.msg.channel,
                createdOn: Date.now(),
            }

            await Notif.updateMany({ user: { $nin: online }, 'notifs.channel': data.msg.channel }, { $inc: { 'notifs.$.count': 1 }});
            await Notif.updateMany({ user: { $nin: online }, 'notifs.channel': { $nin: [data.id] } }, { $push: { notifs: notif } });
        });

        s.on("create_notif", async (data, callback) => {
            const notif = {
                guild: data.guild,
                channel: data.channel,
                count: 1,
                createdOn: Date.now(),
            }

            await Notif.updateOne({ user: data.user, 'notifs.channel': data.channel }, { $inc: { 'notifs.$.count': 1 } });
            await Notif.updateOne({ user: data.user, 'notifs.channel': { $nin: [data.channel] } }, { $push: { notifs: notif } });

            const notifications = await Notif.findOne({ user: data.user });
            const notification = notifications?.notifs.find(n => n.channel === data.channel);

            if (notification) callback(notification);
        })

        s.on("notif_rm", async (channel, user) => {
            await Notif.findOneAndUpdate({ user: user }, { $pull: { notifs: { channel } } });
        })

        s.on("con_user", async (userId, channelId, user) => {
            io.to(userId).emit("user_join_new", s.id, channelId, user);
        });

        s.on('update_voice_state', async (channel: string, user: string, muted: boolean, deafen: boolean, callback) => {
            try {
                const updatedChannel = await Channel.findByIdAndUpdate(channel, { $set: { 'users.$[el].muted': muted, 'users.$[el].deafen': deafen } }, { arrayFilters: [{ 'el.user': user }], new: true });
                s.broadcast.emit('updated_voice_state', updatedChannel);
                callback(updatedChannel);
            } catch (err) {
                console.log(err);
            }
        });

        s.on("user_join", async (id: string, user: string, muted: boolean, deafen: boolean) => {
            const isAlready = await Channel.findById(id);

            if (isAlready?.users.find(u => u.user === user)) return console.log('already in room');

            s.broadcast.emit("joined_channel", id, user, muted, deafen);

            await s.join(id);

            try {
                await Channel.findByIdAndUpdate(id, { $push: { users: { user, muted, deafen } } });
            } catch (err) {
                console.log(err);
            }

            s.on("disconnect", async () => {
                try {
                    await Channel.findByIdAndUpdate(id, { $pull: { users: { user } } });
                } catch (err) {
                    console.log(err);
                }
                s.broadcast.emit("user_disconnected", id, user);
                await s.leave(id);
            });
        });

        s.on("leave_channel", async (id, user) => {
            try {
                await Channel.findByIdAndUpdate(id, { $pull: { users: { user } } });

                s.broadcast.emit("user_disconnected", id, user);
            } catch (err) {
                console.log(err);
            }
        });

        s.on("disconnect", async () => {
            if (!s.user) return;
            if (io.sockets.adapter.rooms.get(`${s.user}-status`)) return;

            const user = await Member.findByIdAndUpdate(s.user, { $set: { status: "offline" } }, { new: true });

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